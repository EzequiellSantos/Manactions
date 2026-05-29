import { apiFetch } from "@/lib/api";
import type { Demanda, PrioridadeDemanda } from "@/lib/mock-data";
import { normalizeDemanda } from "@/lib/backend/normalizers";

export interface CreateDemandaPayload {
  areaId: string;
  titulo: string;
  categoria: string;
  prioridade: PrioridadeDemanda;
  descricao: string;
  prazo?: string;
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
    body: JSON.stringify(payload),
  }));
}

export async function addDemandaComment(id: string, texto: string): Promise<void> {
  await apiFetch(`/demandas/${id}/comentarios`, {
    method: "POST",
    body: JSON.stringify({ conteudo: texto }),
  });
}
