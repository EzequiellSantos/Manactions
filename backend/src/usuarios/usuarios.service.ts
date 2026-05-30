import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Papel, Prisma, StatusDemanda } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePapelDto } from './dto/update-papel.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const usuarioInclude = {
  area: {
    select: {
      id: true,
      nome: true,
      slug: true,
    },
  },
} satisfies Prisma.UsuarioInclude;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filtros?: {
    areaId?: string;
    papel?: Papel;
    ativo?: boolean;
  }) {
    return this.prisma.usuario.findMany({
      where: {
        ...(filtros?.areaId && { areaId: filtros.areaId }),
        ...(filtros?.papel && { papel: filtros.papel }),
        ...(filtros?.ativo !== undefined && { ativo: filtros.ativo }),
      },
      include: usuarioInclude,
      orderBy: { nome: 'asc' },
    });
  }

  async findById(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: usuarioInclude,
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário "${id}" não encontrado`);
    }

    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto, usuarioLogadoId: string) {
    const usuarioLogado = await this.findById(usuarioLogadoId);

    if (usuarioLogado.id !== id && usuarioLogado.papel !== Papel.ADMIN) {
      throw new ForbiddenException(
        'Você só pode atualizar o próprio perfil',
      );
    }

    await this.findById(id);

    return this.prisma.usuario.update({
      where: { id },
      data: dto,
      include: usuarioInclude,
    });
  }

  async updatePapel(id: string, dto: UpdatePapelDto, adminId: string) {
    await this.ensureAdmin(adminId);
    await this.findById(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { papel: dto.papel },
      include: usuarioInclude,
    });
  }

  async updateByAdmin(
    id: string,
    dto: { areaId?: string | null; recebeDemandas?: boolean },
    adminId: string,
  ) {
    await this.ensureAdmin(adminId);
    await this.findById(id);

    return this.prisma.usuario.update({
      where: { id },
      data: {
        ...(dto.areaId !== undefined && { areaId: dto.areaId }),
        ...(dto.recebeDemandas !== undefined && { recebeDemandas: dto.recebeDemandas }),
      },
      include: usuarioInclude,
    });
  }

  async desativar(id: string, adminId: string) {
    await this.ensureAdmin(adminId);
    await this.findById(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      include: usuarioInclude,
    });
  }

  async getEstatisticas(usuarioId: string) {
    await this.findById(usuarioId);

    const baseWhere = {
      OR: [{ solicitanteId: usuarioId }, { responsavelId: usuarioId }],
    };

    const [abertas, concluidas, pendentes] = await Promise.all([
      this.prisma.demanda.count({
        where: {
          ...baseWhere,
          status: StatusDemanda.ABERTA,
        },
      }),
      this.prisma.demanda.count({
        where: {
          ...baseWhere,
          status: StatusDemanda.CONCLUIDA,
        },
      }),
      this.prisma.demanda.count({
        where: {
          responsavelId: usuarioId,
          status: {
            in: [StatusDemanda.EM_ANALISE, StatusDemanda.EM_ANDAMENTO],
          },
        },
      }),
    ]);

    return { abertas, concluidas, pendentes };
  }

  private async ensureAdmin(adminId: string) {
    const admin = await this.prisma.usuario.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.papel !== Papel.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem executar esta ação');
    }
  }
}
