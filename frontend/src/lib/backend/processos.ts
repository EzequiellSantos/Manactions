import { apiFetch } from "@/lib/api";
import type { ProcessoArea } from "@/lib/types";
import { normalizeProcesso } from "@/lib/backend/normalizers";

export interface SaveProcessoPayload {
  titulo: string;
  descricao: string;
  conteudo: string;
  areaId: string;
  categoria: string;
  tags?: string[];
  publicado?: boolean;
}

export async function getProcessos(): Promise<ProcessoArea[]> {
  const response = await apiFetch<unknown[] | { data?: unknown[] }>("/processos");
  const data = Array.isArray(response) ? response : response.data ?? [];
  return data.map(normalizeProcesso);
}

export async function getProcessoByIdFromApi(id: string): Promise<ProcessoArea> {
  return normalizeProcesso(await apiFetch<unknown>(`/processos/${id}`));
}

export async function getProcessoCategorias(): Promise<string[]> {
  const response = await apiFetch<{ categorias?: string[] }>("/processos/categorias");
  return response.categorias ?? [];
}

export async function createProcesso(payload: SaveProcessoPayload): Promise<ProcessoArea> {
  return normalizeProcesso(await apiFetch<unknown>("/processos", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function updateProcesso(id: string, payload: Partial<SaveProcessoPayload>): Promise<ProcessoArea> {
  return normalizeProcesso(await apiFetch<unknown>(`/processos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }));
}

export async function publishProcesso(id: string): Promise<ProcessoArea> {
  return normalizeProcesso(await apiFetch<unknown>(`/processos/${id}/publicar`, {
    method: "PATCH",
  }));
}

export async function deleteProcesso(id: string): Promise<void> {
  await apiFetch(`/processos/${id}`, { method: "DELETE" });
}
