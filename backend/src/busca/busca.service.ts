import { Injectable } from '@nestjs/common';
import { Prisma, Usuario } from '@prisma/client';
import { buildDemandaAccessWhere } from '../common/utils/demanda-permissions';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BuscaService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarGlobal(termo: string, usuarioLogado: Usuario) {
    const q = termo.trim();

    const areaWhere: Prisma.AreaWhereInput = {
      ativo: true,
      OR: [
        { nome: { contains: q, mode: 'insensitive' } },
        { descricao: { contains: q, mode: 'insensitive' } },
      ],
    };

    const usuarioWhere: Prisma.UsuarioWhereInput = {
      ativo: true,
      OR: [
        { nome: { contains: q, mode: 'insensitive' } },
        { cargo: { contains: q, mode: 'insensitive' } },
      ],
    };

    const demandaWhere: Prisma.DemandaWhereInput = {
      AND: [
        buildDemandaAccessWhere(usuarioLogado),
        {
          OR: [
            { titulo: { contains: q, mode: 'insensitive' } },
            { descricao: { contains: q, mode: 'insensitive' } },
          ],
        },
      ],
    };

    const processoWhere: Prisma.ProcessoWhereInput = {
      publicado: true,
      OR: [
        { titulo: { contains: q, mode: 'insensitive' } },
        { descricao: { contains: q, mode: 'insensitive' } },
      ],
    };

    const [areas, usuarios, demandas, processos] = await Promise.all([
      this.prisma.area.findMany({
        where: areaWhere,
        select: {
          id: true,
          nome: true,
          slug: true,
          descricao: true,
          categoria: true,
        },
        take: 5,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.usuario.findMany({
        where: usuarioWhere,
        select: {
          id: true,
          nome: true,
          email: true,
          cargo: true,
          avatarUrl: true,
        },
        take: 5,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.demanda.findMany({
        where: demandaWhere,
        select: {
          id: true,
          titulo: true,
          descricao: true,
          status: true,
          prioridade: true,
        },
        take: 5,
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.processo.findMany({
        where: processoWhere,
        select: {
          id: true,
          titulo: true,
          slug: true,
          descricao: true,
          categoria: true,
        },
        take: 5,
        orderBy: { titulo: 'asc' },
      }),
    ]);

    return {
      areas,
      usuarios: usuarios.map((u) => ({
        ...u,
        cargo: u.cargo ?? undefined,
        avatarUrl: u.avatarUrl ?? undefined,
      })),
      demandas,
      processos,
      total: areas.length + usuarios.length + demandas.length + processos.length,
    };
  }
}
