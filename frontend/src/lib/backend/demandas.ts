import { apiFetch } from "@/lib/api";
import type { Demanda, DemandaStatus, PrioridadeDemanda } from "@/lib/types";
import { normalizeDemanda } from "@/lib/backend/normalizers";

export interface CreateDemandaPayload {
  areaId: string;
  titulo: string;
  prioridade: PrioridadeDemanda;
  descricao: string;
  prazo?: string;
  tags?: string[];
}

export interface UpdateDemandaPayload {
  titulo?: string;
  prioridade?: PrioridadeDemanda;
  descricao?: string;
  prazo?: string;
  tags?: string[];
}

const PRIORIDADE_API: Record<PrioridadeDemanda, string> = {
  baixa: "BAIXA",
  media: "MEDIA",
  alta: "ALTA",
  urgente: "URGENTE",
};

const STATUS_API: Record<DemandaStatus, string> = {
  aberta: "ABERTA",
  em_analise: "EM_ANALISE",
  em_andamento: "EM_ANDAMENTO",
  concluida: "CONCLUIDA",
  cancelada: "CANCELADA",
  rejeitada: "REJEITADA",
};

function toCreatePayload(payload: CreateDemandaPayload) {
  return {
    areaId: payload.areaId,
    titulo: payload.titulo,
    descricao: payload.descricao,
    prioridade: PRIORIDADE_API[payload.prioridade],
    prazo: payload.prazo,
    tags: payload.tags,
  };
}

function toUpdatePayload(payload: UpdateDemandaPayload) {
  return {
    titulo: payload.titulo,
    descricao: payload.descricao,
    prioridade: payload.prioridade ? PRIORIDADE_API[payload.prioridade] : undefined,
    prazo: payload.prazo,
    tags: payload.tags,
  };
}

export async function getDemandas(): Promise<Demanda[]> {
  const response = await apiFetch<unknown[] | { data?: unknown[] }>("/demandas");
  const data = Array.isArray(response) ? response : response.data ?? [];
  return data.map(normalizeDemanda);
}

export async function getDemandaById(id: string): Promise<Demanda> {
  return normalizeDemanda(await apiFetch<unknown>(`/demandas/${id}`));
}

export async function createDemanda(payload: CreateDemandaPayload): Promise<Demanda> {
  return normalizeDemanda(await apiFetch<unknown>("/demandas", {
    method: "POST",
    body: JSON.stringify(toCreatePayload(payload)),
  }));
}

export async function updateDemanda(id: string, payload: UpdateDemandaPayload): Promise<Demanda> {
  return normalizeDemanda(await apiFetch<unknown>(`/demandas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toUpdatePayload(payload)),
  }));
}

export async function updateDemandaStatus(id: string, status: DemandaStatus, comentario?: string): Promise<Demanda> {
  return normalizeDemanda(await apiFetch<unknown>(`/demandas/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: STATUS_API[status], comentario }),
  }));
}

export async function assumeDemanda(id: string): Promise<Demanda> {
  return normalizeDemanda(await apiFetch<unknown>(`/demandas/${id}/assumir`, {
    method: "POST",
  }));
}

export async function assignDemanda(id: string, responsavelId: string): Promise<Demanda> {
  return normalizeDemanda(await apiFetch<unknown>(`/demandas/${id}/atribuir`, {
    method: "PATCH",
    body: JSON.stringify({ responsavelId }),
  }));
}

export async function addDemandaComment(id: string, texto: string): Promise<unknown> {
  return apiFetch(`/demandas/${id}/comentarios`, {
    method: "POST",
    body: JSON.stringify({ conteudo: texto }),
  });
}
