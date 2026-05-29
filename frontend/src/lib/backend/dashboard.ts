import { apiFetch } from "@/lib/api";
import type { Area, Demanda, Aviso } from "@/lib/types";
import { normalizeArea, normalizeDemanda } from "@/lib/backend/normalizers";

interface DashboardResponse {
  estatisticasGerais: {
    totalAreas: number;
    totalDemandasAbertas: number;
    totalDemandasPendentesAprovacao: number;
    processosRecentes: number;
  };
  minhasDemandasRecentes: unknown[];
  areasDestaques: unknown[];
  comunicados: Array<{
    id: string;
    titulo?: string;
    mensagem?: string;
    tipo?: string;
    criadoEm?: string;
    lida?: boolean;
  }>;
}

export interface DashboardData {
  stats: {
    totalAreas: number;
    minhasDemandasAbertas: number;
    pendentesAprovacao: number;
    processosRecentes: number;
  };
  demandasRecentes: Demanda[];
  areasDestaques: Area[];
  comunicados: Aviso[];
}

function formatRelative(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  const diff = Math.max(1, Math.floor((Date.now() - parsed.getTime()) / 60000));
  if (diff < 60) return `ha ${diff} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `ha ${hours} h`;
  return `ha ${Math.floor(hours / 24)} d`;
}

export async function getDashboard(): Promise<DashboardData> {
  const data = await apiFetch<DashboardResponse>("/dashboard");

  return {
    stats: {
      totalAreas: data.estatisticasGerais.totalAreas,
      minhasDemandasAbertas: data.estatisticasGerais.totalDemandasAbertas,
      pendentesAprovacao: data.estatisticasGerais.totalDemandasPendentesAprovacao,
      processosRecentes: data.estatisticasGerais.processosRecentes,
    },
    demandasRecentes: data.minhasDemandasRecentes.map(normalizeDemanda),
    areasDestaques: data.areasDestaques.map(normalizeArea),
    comunicados: data.comunicados.map((item) => ({
      id: item.id,
      titulo: item.titulo ?? "Comunicado",
      resumo: item.mensagem ?? "",
      autor: item.tipo ?? "Sistema",
      data: formatRelative(item.criadoEm),
      destaque: item.lida === false,
    })),
  };
}
