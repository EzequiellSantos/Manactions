import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusDemanda } from '@prisma/client';
import { generateUniqueSlug, slugify } from '../common/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

const areaListInclude = {
  responsaveis: {
    select: {
      id: true,
      nome: true,
      email: true,
      cargo: true,
      avatarUrl: true,
      recebeDemandas: true,
    },
  },
  canaisContato: true,
} satisfies Prisma.AreaInclude;

const areaDetailInclude = {
  ...areaListInclude,
  processos: {
    select: {
      id: true,
      titulo: true,
      slug: true,
      categoria: true,
      publicado: true,
    },
  },
} satisfies Prisma.AreaInclude;

@Injectable()
export class AreasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filtros?: { categoria?: string }) {
    return this.prisma.area.findMany({
      where: {
        ativo: true,
        ...(filtros?.categoria && { categoria: filtros.categoria }),
      },
      include: areaListInclude,
      orderBy: { nome: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const area = await this.prisma.area.findFirst({
      where: { slug, ativo: true },
      include: areaDetailInclude,
    });

    if (!area) {
      throw new NotFoundException(`Área "${slug}" não encontrada`);
    }

    const demandasAbertas = await this.prisma.demanda.count({
      where: {
        areaId: area.id,
        status: StatusDemanda.ABERTA,
      },
    });

    return { ...area, demandasAbertas };
  }

  async create(dto: CreateAreaDto, usuarioId: string) {
    const slug = await this.resolveSlug(dto.slug, dto.nome);

    return this.prisma.$transaction(async (tx) => {
      const area = await tx.area.create({
        data: {
          nome: dto.nome,
          slug,
          descricao: dto.descricao,
          responsabilidades: dto.responsabilidades,
          categoria: dto.categoria,
          cor: dto.cor,
          icone: dto.icone,
          canaisContato: dto.canaisContato?.length
            ? { create: dto.canaisContato }
            : undefined,
        },
        include: areaListInclude,
      });

      await tx.historicoEvento.create({
        data: {
          tipo: 'AREA_CRIADA',
          descricao: `Área "${area.nome}" criada`,
          areaId: area.id,
          autorId: usuarioId,
          metadados: { slug: area.slug },
        },
      });

      return area;
    });
  }

  async update(id: string, dto: UpdateAreaDto, usuarioId: string) {
    const existing = await this.prisma.area.findUnique({ where: { id } });

    if (!existing || !existing.ativo) {
      throw new NotFoundException(`Área "${id}" não encontrada`);
    }

    const { canaisContato, slug: slugInput, ...areaData } = dto;
    const slug =
      slugInput !== undefined
        ? await this.resolveSlug(slugInput, dto.nome ?? existing.nome, id)
        : undefined;

    return this.prisma.$transaction(async (tx) => {
      if (canaisContato !== undefined) {
        await tx.canalContato.deleteMany({ where: { areaId: id } });
        if (canaisContato.length > 0) {
          await tx.canalContato.createMany({
            data: canaisContato.map((canal) => ({ ...canal, areaId: id })),
          });
        }
      }

      const area = await tx.area.update({
        where: { id },
        data: {
          ...areaData,
          ...(slug !== undefined && { slug }),
        },
        include: areaListInclude,
      });

      await tx.historicoEvento.create({
        data: {
          tipo: 'AREA_ATUALIZADA',
          descricao: `Área "${area.nome}" atualizada`,
          areaId: area.id,
          autorId: usuarioId,
          metadados: { alteracoes: Object.keys(dto) },
        },
      });

      return area;
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.area.findUnique({ where: { id } });

    if (!existing || !existing.ativo) {
      throw new NotFoundException(`Área "${id}" não encontrada`);
    }

    return this.prisma.area.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async addResponsavel(areaId: string, usuarioId: string) {
    await this.ensureAreaExists(areaId);
    await this.ensureUsuarioExists(usuarioId);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (usuario?.areaId === areaId) {
      throw new ConflictException('Usuário já é responsável desta área');
    }

    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { areaId },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        avatarUrl: true,
      },
    });
  }

  async removeResponsavel(areaId: string, usuarioId: string) {
    await this.ensureAreaExists(areaId);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario || usuario.areaId !== areaId) {
      throw new NotFoundException('Responsável não encontrado nesta área');
    }

    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { areaId: null },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        avatarUrl: true,
      },
    });
  }

  private async resolveSlug(
    slugInput: string | undefined,
    nome: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugInput?.trim() ? slugify(slugInput) : slugify(nome);

    if (!base) {
      throw new ConflictException('Não foi possível gerar um slug válido');
    }

    return generateUniqueSlug(base, async (slug) => {
      const existing = await this.prisma.area.findFirst({
        where: {
          slug,
          ...(excludeId && { NOT: { id: excludeId } }),
        },
      });
      return !!existing;
    });
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
  }
}
