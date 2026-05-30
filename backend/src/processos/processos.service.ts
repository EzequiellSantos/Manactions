import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Papel, Prisma, Usuario } from '@prisma/client';
import { generateUniqueSlug, slugify } from '../common/utils/slugify';
import { incrementVersion } from '../common/utils/version';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { FiltroProcessosDto } from './dto/filtro-processos.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';

const areaSelect = {
  id: true,
  nome: true,
  slug: true,
} satisfies Prisma.AreaSelect;

const processoInclude = {
  area: { select: areaSelect },
} satisfies Prisma.ProcessoInclude;

@Injectable()
export class ProcessosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filtros: FiltroProcessosDto, usuarioLogado: Usuario) {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filtros, usuarioLogado);

    const [data, total] = await Promise.all([
      this.prisma.processo.findMany({
        where,
        include: processoInclude,
        orderBy: { atualizadoEm: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.processo.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCategorias(usuarioLogado: Usuario) {
    const where: Prisma.ProcessoWhereInput =
      usuarioLogado.papel === Papel.ADMIN
        ? {}
        : { publicado: true };

    const result = await this.prisma.processo.findMany({
      where,
      select: { categoria: true },
      distinct: ['categoria'],
      orderBy: { categoria: 'asc' },
    });

    return result.map((item) => item.categoria);
  }

  async findById(id: string, usuarioLogado?: Usuario) {
    const processo = await this.prisma.processo.findUnique({
      where: { id },
      include: processoInclude,
    });

    if (!processo) {
      throw new NotFoundException(`Processo "${id}" não encontrado`);
    }

    this.ensureCanView(processo.publicado, usuarioLogado);

    await this.incrementarVisualizacoes(id);

    return {
      ...processo,
      visualizacoes: processo.visualizacoes + 1,
    };
  }

  async findBySlug(slug: string, usuarioLogado?: Usuario) {
    const processo = await this.prisma.processo.findUnique({
      where: { slug },
      include: processoInclude,
    });

    if (!processo) {
      throw new NotFoundException(`Processo "${slug}" não encontrado`);
    }

    this.ensureCanView(processo.publicado, usuarioLogado);

    await this.incrementarVisualizacoes(processo.id);

    return {
      ...processo,
      visualizacoes: processo.visualizacoes + 1,
    };
  }

  async create(dto: CreateProcessoDto, autorId: string) {
    await this.ensureAreaExists(dto.areaId);
    const autor = await this.ensureUsuarioExists(autorId);
    this.ensureCanManageArea(autor, dto.areaId);

    const slug = await this.resolveSlug(dto.titulo);

    return this.prisma.processo.create({
      data: {
        titulo: dto.titulo,
        slug,
        descricao: dto.descricao,
        conteudo: dto.conteudo,
        areaId: dto.areaId,
        categoria: dto.categoria,
        tags: dto.tags ?? [],
        publicado: dto.publicado ?? false,
      },
      include: processoInclude,
    });
  }

  async update(id: string, dto: UpdateProcessoDto, usuarioId: string) {
    const usuario = await this.ensureUsuarioExists(usuarioId);

    const existing = await this.prisma.processo.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Processo "${id}" não encontrado`);
    }

    this.ensureCanManageArea(usuario, existing.areaId);

    if (dto.areaId !== undefined) {
      await this.ensureAreaExists(dto.areaId);
      this.ensureCanManageArea(usuario, dto.areaId);
    }

    const slug =
      dto.titulo !== undefined
        ? await this.resolveSlug(dto.titulo, id)
        : undefined;

    return this.prisma.processo.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(slug !== undefined && { slug }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.conteudo !== undefined && { conteudo: dto.conteudo }),
        ...(dto.areaId !== undefined && { areaId: dto.areaId }),
        ...(dto.categoria !== undefined && { categoria: dto.categoria }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.publicado !== undefined && { publicado: dto.publicado }),
        versao: incrementVersion(existing.versao),
      },
      include: processoInclude,
    });
  }

  async publicar(id: string, adminId: string) {
    await this.ensureAdmin(adminId);

    const existing = await this.prisma.processo.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Processo "${id}" não encontrado`);
    }

    return this.prisma.processo.update({
      where: { id },
      data: { publicado: true },
      include: processoInclude,
    });
  }

  async delete(id: string, adminId: string) {
    await this.ensureAdmin(adminId);

    const existing = await this.prisma.processo.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Processo "${id}" não encontrado`);
    }

    await this.prisma.processo.delete({ where: { id } });

    return { success: true };
  }

  private buildWhereClause(
    filtros: FiltroProcessosDto,
    usuarioLogado: Usuario,
  ): Prisma.ProcessoWhereInput {
    const conditions: Prisma.ProcessoWhereInput[] = [];

    if (usuarioLogado.papel !== Papel.ADMIN) {
      conditions.push({ publicado: true });
    } else if (filtros.publicado !== undefined) {
      conditions.push({ publicado: filtros.publicado });
    }

    if (filtros.areaId) {
      conditions.push({ areaId: filtros.areaId });
    }

    if (filtros.categoria) {
      conditions.push({ categoria: filtros.categoria });
    }

    if (filtros.tags) {
      conditions.push({ tags: { has: filtros.tags } });
    }

    if (filtros.q) {
      conditions.push({
        OR: [
          { titulo: { contains: filtros.q, mode: 'insensitive' } },
          { descricao: { contains: filtros.q, mode: 'insensitive' } },
          { conteudo: { contains: filtros.q, mode: 'insensitive' } },
        ],
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  private async incrementarVisualizacoes(id: string) {
    await this.prisma.$executeRaw`
      UPDATE "Processo"
      SET "visualizacoes" = "visualizacoes" + 1
      WHERE id = ${id}
    `;
  }

  private async resolveSlug(titulo: string, excludeId?: string): Promise<string> {
    const base = slugify(titulo);

    if (!base) {
      throw new NotFoundException('Não foi possível gerar slug para o processo');
    }

    return generateUniqueSlug(base, async (slug) => {
      const existing = await this.prisma.processo.findFirst({
        where: {
          slug,
          ...(excludeId && { NOT: { id: excludeId } }),
        },
      });
      return !!existing;
    });
  }

  private ensureCanView(publicado: boolean, usuarioLogado?: Usuario) {
    if (publicado) {
      return;
    }

    if (
      !usuarioLogado ||
      (usuarioLogado.papel !== Papel.ADMIN &&
        usuarioLogado.papel !== Papel.GESTOR)
    ) {
      throw new ForbiddenException('Processo não publicado');
    }
  }

  private async ensureAreaExists(areaId: string) {
    const area = await this.prisma.area.findFirst({
      where: { id: areaId, ativo: true },
    });

    if (!area) {
      throw new NotFoundException(`Área "${areaId}" não encontrada`);
    }
  }

  private async ensureUsuarioExists(usuarioId: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioId, ativo: true },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário "${usuarioId}" não encontrado`);
    }

    return usuario;
  }

  private ensureCanManageArea(
    usuario: Usuario,
    areaId: string,
  ) {
    if (usuario.papel === Papel.ADMIN) {
      return;
    }

    if (usuario.papel === Papel.GESTOR && usuario.areaId === areaId) {
      return;
    }

    throw new ForbiddenException(
      'Você só pode gerenciar processos da sua área',
    );
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
