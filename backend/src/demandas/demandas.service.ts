import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Papel,
  Prisma,
  StatusDemanda,
  Usuario,
} from '@prisma/client';
import {
  buildDemandaAccessWhere,
  canAccessDemanda,
} from '../common/utils/demanda-permissions';
import {
  STATUS_LABELS,
  validarTransicaoStatus,
} from '../common/utils/demanda-status';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AlterarStatusDto } from './dto/alterar-status.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateDemandaDto } from './dto/create-demanda.dto';
import { FiltroDemandasDto } from './dto/filtro-demandas.dto';
import { UpdateDemandaDto } from './dto/update-demanda.dto';

const usuarioResumoSelect = {
  id: true,
  nome: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UsuarioSelect;

const areaResumoSelect = {
  id: true,
  nome: true,
  slug: true,
} satisfies Prisma.AreaSelect;

const demandaListInclude = {
  area: { select: areaResumoSelect },
  solicitante: { select: usuarioResumoSelect },
  responsavel: { select: usuarioResumoSelect },
} satisfies Prisma.DemandaInclude;

const demandaDetailInclude = {
  ...demandaListInclude,
  historico: {
    orderBy: { criadoEm: 'desc' as const },
    include: { autor: { select: usuarioResumoSelect } },
  },
  comentarios: {
    orderBy: { criadoEm: 'asc' as const },
    include: { autor: { select: usuarioResumoSelect } },
  },
  anexos: { orderBy: { criadoEm: 'desc' as const } },
} satisfies Prisma.DemandaInclude;

@Injectable()
export class DemandasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacoesService: NotificacoesService,
  ) {}

  async findAll(filtros: FiltroDemandasDto, usuarioLogado: Usuario) {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filtros, usuarioLogado);

    const [data, total] = await Promise.all([
      this.prisma.demanda.findMany({
        where,
        include: demandaListInclude,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.demanda.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, usuarioLogado: Usuario) {
    const demanda = await this.prisma.demanda.findUnique({
      where: { id },
      include: demandaDetailInclude,
    });

    if (!demanda) {
      throw new NotFoundException(`Demanda "${id}" não encontrada`);
    }

    if (!canAccessDemanda(usuarioLogado, demanda)) {
      throw new ForbiddenException('Sem permissão para acessar esta demanda');
    }

    return demanda;
  }

  async create(dto: CreateDemandaDto, solicitante: Usuario) {
    const area = await this.prisma.area.findFirst({
      where: { id: dto.areaId, ativo: true },
      include: {
        responsaveis: {
          where: { ativo: true, recebeDemandas: true },
          select: {
            id: true,
            nome: true,
            email: true,
            notificacoesEmail: true,
            notificacoesInApp: true,
          },
        },
      },
    });

    if (!area) {
      throw new NotFoundException(`Área "${dto.areaId}" não encontrada`);
    }

    const demanda = await this.prisma.$transaction(async (tx) => {
      const created = await tx.demanda.create({
        data: {
          titulo: dto.titulo,
          descricao: dto.descricao,
          areaId: dto.areaId,
          prioridade: dto.prioridade,
          prazo: dto.prazo ? new Date(dto.prazo) : undefined,
          tags: dto.tags ?? [],
          solicitanteId: solicitante.id,
          status: StatusDemanda.ABERTA,
        },
        include: demandaDetailInclude,
      });

      await tx.historicoEvento.create({
        data: {
          tipo: 'DEMANDA_CRIADA',
          descricao: `Demanda criada por ${solicitante.nome}`,
          demandaId: created.id,
          autorId: solicitante.id,
        },
      });

      return created;
    });

    const link = this.notificacoesService.buildDemandaLink(demanda.id);

    for (const responsavel of area.responsaveis) {
      if (responsavel.id === solicitante.id) {
        continue;
      }

      if (responsavel.notificacoesInApp) {
        await this.notificacoesService.criarNotificacao(
          responsavel.id,
          'nova_demanda',
          'Nova demanda na sua área',
          `${solicitante.nome} abriu a demanda "${demanda.titulo}"`,
          link,
        );
      }

      if (responsavel.notificacoesEmail) {
        await this.notificacoesService.enviarEmailTemplate(
          responsavel.email,
          'nova_demanda',
          {
            demandaTitulo: demanda.titulo,
            mensagem: `${solicitante.nome} abriu uma nova demanda na área ${area.nome}.`,
            link,
          },
        );
      }
    }

    return demanda;
  }

  async update(id: string, dto: UpdateDemandaDto, usuarioLogado: Usuario) {
    const demanda = await this.findById(id, usuarioLogado);

    const podeEditarCompleto =
      usuarioLogado.papel === Papel.ADMIN ||
      (demanda.solicitanteId === usuarioLogado.id &&
        demanda.status === StatusDemanda.ABERTA);
    const podeEditarPrazo = demanda.responsavelId === usuarioLogado.id;

    if (!podeEditarCompleto && !podeEditarPrazo) {
      throw new ForbiddenException(
        'Somente o solicitante (com demanda aberta), responsável ou admin pode editar',
      );
    }

    return this.prisma.demanda.update({
      where: { id },
      data: {
        ...(podeEditarCompleto && dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(podeEditarCompleto && dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(podeEditarCompleto && dto.prioridade !== undefined && { prioridade: dto.prioridade }),
        ...(podeEditarCompleto && dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.prazo !== undefined && { prazo: new Date(dto.prazo) }),
      },
      include: demandaDetailInclude,
    });
  }

  async alterarStatus(
    id: string,
    dto: AlterarStatusDto,
    usuarioLogado: Usuario,
  ) {
    const demanda = await this.findById(id, usuarioLogado);
    validarTransicaoStatus(demanda.status, dto.status);

    const statusAnterior = demanda.status;

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.demanda.update({
        where: { id },
        data: { status: dto.status },
        include: demandaDetailInclude,
      });

      const descricao = dto.comentario
        ? `Status alterado de ${STATUS_LABELS[statusAnterior]} para ${STATUS_LABELS[dto.status]}: ${dto.comentario}`
        : `Status alterado de ${STATUS_LABELS[statusAnterior]} para ${STATUS_LABELS[dto.status]}`;

      await tx.historicoEvento.create({
        data: {
          tipo: 'STATUS_ALTERADO',
          descricao,
          demandaId: id,
          autorId: usuarioLogado.id,
          metadados: {
            statusAnterior,
            statusNovo: dto.status,
            comentario: dto.comentario,
          },
        },
      });

      return result;
    });

    await this.notificarSolicitanteStatus(
      updated,
      statusAnterior,
      dto.status,
      dto.comentario,
    );

    return updated;
  }

  async assumirDemanda(id: string, usuarioLogado: Usuario) {
    const demanda = await this.findById(id, usuarioLogado);

    const podeAssumir =
      usuarioLogado.papel === Papel.ADMIN ||
      demanda.solicitanteId === usuarioLogado.id ||
      usuarioLogado.recebeDemandas === true;

    if (!podeAssumir) {
      throw new ForbiddenException(
        'Você não está habilitado para assumir demandas. Contate o administrador.',
      );
    }

    if (demanda.responsavelId === usuarioLogado.id) {
      return demanda;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.demanda.update({
        where: { id },
        data: { responsavelId: usuarioLogado.id },
        include: demandaDetailInclude,
      });

      await tx.historicoEvento.create({
        data: {
          tipo: 'DEMANDA_ASSUMIDA',
          descricao: `${usuarioLogado.nome} assumiu a demanda`,
          demandaId: id,
          autorId: usuarioLogado.id,
        },
      });

      return result;
    });

    if (demanda.solicitanteId !== usuarioLogado.id) {
      const solicitante = await this.prisma.usuario.findUnique({
        where: { id: demanda.solicitanteId },
      });

      if (solicitante) {
        const link = this.notificacoesService.buildDemandaLink(id);

        if (solicitante.notificacoesInApp) {
          await this.notificacoesService.criarNotificacao(
            solicitante.id,
            'nova_atribuicao',
            'Demanda assumida',
            `${usuarioLogado.nome} assumiu sua demanda "${demanda.titulo}"`,
            link,
          );
        }

        if (solicitante.notificacoesEmail) {
          await this.notificacoesService.enviarEmailTemplate(
            solicitante.email,
            'nova_atribuicao',
            {
              demandaTitulo: demanda.titulo,
              autor: usuarioLogado.nome,
              link,
            },
          );
        }
      }
    }

    return updated;
  }

  async adicionarComentario(
    demandaId: string,
    dto: CreateComentarioDto,
    autor: Usuario,
  ) {
    const demanda = await this.findById(demandaId, autor);

    const comentario = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comentario.create({
        data: {
          conteudo: dto.conteudo,
          demandaId,
          autorId: autor.id,
        },
        include: { autor: { select: usuarioResumoSelect } },
      });

      await tx.historicoEvento.create({
        data: {
          tipo: 'COMENTARIO_ADICIONADO',
          descricao: `${autor.nome} adicionou um comentário`,
          demandaId,
          autorId: autor.id,
          metadados: { comentarioId: created.id },
        },
      });

      return created;
    });

    await this.notificarPartesComentario(demanda, autor, dto.conteudo);

    return comentario;
  }

  async listarComentarios(demandaId: string, usuarioLogado: Usuario) {
    await this.findById(demandaId, usuarioLogado);

    return this.prisma.comentario.findMany({
      where: { demandaId },
      include: { autor: { select: usuarioResumoSelect } },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async getEstatisticas() {
    const [
      porStatusRaw,
      porPrioridadeRaw,
      porAreaRaw,
      demandasConcluidas,
    ] = await Promise.all([
      this.prisma.demanda.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.demanda.groupBy({
        by: ['prioridade'],
        _count: { id: true },
      }),
      this.prisma.demanda.groupBy({
        by: ['areaId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      this.prisma.demanda.findMany({
        where: { status: StatusDemanda.CONCLUIDA },
        select: { criadoEm: true, atualizadoEm: true },
      }),
    ]);

    const areaIds = porAreaRaw.map((item) => item.areaId);
    const areas = await this.prisma.area.findMany({
      where: { id: { in: areaIds } },
      select: { id: true, nome: true },
    });
    const areaMap = new Map(areas.map((area) => [area.id, area.nome]));

    const porStatus = Object.fromEntries(
      porStatusRaw.map((item) => [item.status, item._count.id]),
    );
    const porPrioridade = Object.fromEntries(
      porPrioridadeRaw.map((item) => [item.prioridade, item._count.id]),
    );
    const porArea = porAreaRaw.map((item) => ({
      areaId: item.areaId,
      nome: areaMap.get(item.areaId) ?? 'Desconhecida',
      total: item._count.id,
    }));

    let mediaResolucaoDias = 0;
    if (demandasConcluidas.length > 0) {
      const totalDias = demandasConcluidas.reduce((acc, demanda) => {
        const diffMs =
          demanda.atualizadoEm.getTime() - demanda.criadoEm.getTime();
        return acc + diffMs / (1000 * 60 * 60 * 24);
      }, 0);
      mediaResolucaoDias =
        Math.round((totalDias / demandasConcluidas.length) * 10) / 10;
    }

    return { porStatus, porPrioridade, porArea, mediaResolucaoDias };
  }

  private buildWhereClause(
    filtros: FiltroDemandasDto,
    usuarioLogado: Usuario,
  ): Prisma.DemandaWhereInput {
    const accessWhere = buildDemandaAccessWhere(usuarioLogado);

    const dateFilter: Prisma.DemandaWhereInput = {};
    if (filtros.dataInicio || filtros.dataFim) {
      dateFilter.criadoEm = {
        ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
        ...(filtros.dataFim && { lte: new Date(filtros.dataFim) }),
      };
    }

    return {
      AND: [
        accessWhere,
        ...(filtros.status ? [{ status: filtros.status }] : []),
        ...(filtros.prioridade ? [{ prioridade: filtros.prioridade }] : []),
        ...(filtros.areaId ? [{ areaId: filtros.areaId }] : []),
        ...(filtros.solicitanteId
          ? [{ solicitanteId: filtros.solicitanteId }]
          : []),
        ...(filtros.responsavelId
          ? [{ responsavelId: filtros.responsavelId }]
          : []),
        ...(Object.keys(dateFilter).length > 0 ? [dateFilter] : []),
      ],
    };
  }

  private async notificarSolicitanteStatus(
    demanda: {
      id: string;
      titulo: string;
      solicitanteId: string;
      status: StatusDemanda;
    },
    statusAnterior: StatusDemanda,
    statusNovo: StatusDemanda,
    comentario?: string,
  ) {
    const solicitante = await this.prisma.usuario.findUnique({
      where: { id: demanda.solicitanteId },
    });

    if (!solicitante) {
      return;
    }

    const link = this.notificacoesService.buildDemandaLink(demanda.id);
    const mensagem = `Sua demanda "${demanda.titulo}" teve o status alterado para ${STATUS_LABELS[statusNovo]}.`;

    if (solicitante.notificacoesInApp) {
      await this.notificacoesService.criarNotificacao(
        solicitante.id,
        'status_alterado',
        'Status da demanda alterado',
        mensagem,
        link,
      );
    }

    if (solicitante.notificacoesEmail) {
      await this.notificacoesService.enviarEmailTemplate(
        solicitante.email,
        'status_alterado',
        {
          demandaTitulo: demanda.titulo,
          statusAnterior: STATUS_LABELS[statusAnterior],
          statusNovo: STATUS_LABELS[statusNovo],
          mensagem: comentario,
          link,
        },
      );
    }
  }

  private async notificarPartesComentario(
    demanda: {
      id: string;
      titulo: string;
      solicitanteId: string;
      responsavelId: string | null;
    },
    autor: Usuario,
    conteudo: string,
  ) {
    const participanteIds = new Set<string>();

    if (demanda.solicitanteId !== autor.id) {
      participanteIds.add(demanda.solicitanteId);
    }

    if (demanda.responsavelId && demanda.responsavelId !== autor.id) {
      participanteIds.add(demanda.responsavelId);
    }

    if (participanteIds.size === 0) {
      return;
    }

    const participantes = await this.prisma.usuario.findMany({
      where: {
        id: { in: [...participanteIds] },
        ativo: true,
        OR: [
          { id: demanda.solicitanteId },
          { recebeDemandas: true },
        ],
      },
    });

    const link = this.notificacoesService.buildDemandaLink(demanda.id);

    for (const participante of participantes) {
      if (participante.notificacoesInApp) {
        await this.notificacoesService.criarNotificacao(
          participante.id,
          'novo_comentario',
          'Novo comentário na demanda',
          `${autor.nome} comentou em "${demanda.titulo}"`,
          link,
        );
      }

      if (participante.notificacoesEmail) {
        await this.notificacoesService.enviarEmailTemplate(
          participante.email,
          'novo_comentario',
          {
            demandaTitulo: demanda.titulo,
            autor: autor.nome,
            mensagem: conteudo,
            link,
          },
        );
      }
    }
  }
}
