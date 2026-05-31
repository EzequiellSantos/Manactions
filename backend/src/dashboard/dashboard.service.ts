import { Injectable } from '@nestjs/common';
import { Prisma, StatusDemanda, Usuario } from '@prisma/client';
import { buildDemandaAccessWhere } from '../common/utils/demanda-permissions';
import { PrismaService } from '../prisma/prisma.service';

const demandaListInclude = {
  area: { select: { id: true, nome: true, slug: true } },
  solicitante: {
    select: { id: true, nome: true, email: true, avatarUrl: true },
  },
  responsavel: {
    select: { id: true, nome: true, email: true, avatarUrl: true },
  },
} satisfies Prisma.DemandaInclude;

const areaDestaqueInclude = {
  canaisContato: true,
  responsaveis: {
    where: { ativo: true, recebeDemandas: true },
    select: { id: true, nome: true, email: true, avatarUrl: true },
    take: 3,
  },
  _count: { select: { demandas: true } },
} satisfies Prisma.AreaInclude;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(usuarioLogado: Usuario) {
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const [
      totalAreas,
      totalDemandasAbertas,
      totalDemandasPendentesAprovacao,
      processosRecentes,
      minhasDemandasRecentes,
      areasPorDemanda,
      comunicados,
    ] = await Promise.all([
      this.prisma.area.count({ where: { ativo: true } }),
      this.prisma.demanda.count({
        where: {
          solicitanteId: usuarioLogado.id,
          status: StatusDemanda.ABERTA,
        },
      }),
      this.prisma.demanda.count({
        where: {
          solicitanteId: usuarioLogado.id,
          status: StatusDemanda.EM_ANALISE,
        },
      }),
      this.prisma.processo.count({
        where: {
          publicado: true,
          criadoEm: { gte: trintaDiasAtras },
        },
      }),
      this.prisma.demanda.findMany({
        where: {
          AND: [
            buildDemandaAccessWhere(usuarioLogado),
            {
              OR: [
                { solicitanteId: usuarioLogado.id },
                { responsavelId: usuarioLogado.id },
              ],
            },
          ],
        },
        include: demandaListInclude,
        orderBy: { criadoEm: 'desc' },
        take: 5,
      }),
      this.prisma.demanda.groupBy({
        by: ['areaId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 6,
      }),
      this.prisma.notificacao.findMany({
        where: {
          usuarioId: usuarioLogado.id,
          tipo: 'comunicado',
        },
        orderBy: { criadoEm: 'desc' },
        take: 3,
      }),
    ]);

    const areaIds = areasPorDemanda.map((item) => item.areaId);
    const areas = await this.prisma.area.findMany({
      where: { id: { in: areaIds }, ativo: true },
      include: areaDestaqueInclude,
    });

    const areaMap = new Map(areas.map((area) => [area.id, area]));
    const areasDestaques = areasPorDemanda
      .map((item) => areaMap.get(item.areaId))
      .filter((area): area is NonNullable<typeof area> => !!area);

    return {
      estatisticasGerais: {
        totalAreas,
        totalDemandasAbertas,
        totalDemandasPendentesAprovacao,
        processosRecentes,
      },
      minhasDemandasRecentes,
      areasDestaques,
      comunicados,
    };
  }
}
