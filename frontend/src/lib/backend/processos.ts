import { apiFetch } from "@/lib/api";
import type { ProcessoArea } from "@/lib/mock-data";
import { normalizeProcesso } from "@/lib/backend/normalizers";

export async function getProcessos(): Promise<ProcessoArea[]> {
  const response = await apiFetch<unknown[] | { data?: unknown[] }>("/processos");
  const data = Array.isArray(response) ? response : response.data ?? [];
  return data.map(normalizeProcesso);
}

export async function getProcessoByIdFromApi(id: string): Promise<ProcessoArea> {
  return normalizeProcesso(await apiFetch<unknown>(`/processos/${id}`));
}
