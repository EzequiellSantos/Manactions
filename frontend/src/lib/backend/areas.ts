import { apiFetch } from "@/lib/api";
import type { Area, CanalContato } from "@/lib/types";
import { normalizeArea } from "@/lib/backend/normalizers";

export interface SaveAreaPayload {
  nome: string;
  slug?: string;
  descricao: string;
  responsabilidades: string[];
  categoria: string;
  cor: string;
  icone: string;
  canaisContato?: CanalContato[];
}

export async function getAreas(): Promise<Area[]> {
  const data = await apiFetch<unknown[]>("/areas");
  return data.map(normalizeArea);
}

export async function getAreaBySlugFromApi(slug: string): Promise<Area> {
  return normalizeArea(await apiFetch<unknown>(`/areas/${slug}`));
}

export async function createArea(payload: SaveAreaPayload): Promise<Area> {
  return normalizeArea(await apiFetch<unknown>("/areas", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function updateArea(id: string, payload: Partial<SaveAreaPayload>): Promise<Area> {
  return normalizeArea(await apiFetch<unknown>(`/areas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }));
}

export async function deleteArea(id: string): Promise<void> {
  await apiFetch(`/areas/${id}`, { method: "DELETE" });
}

export async function sendResponsavelMessage(
  areaId: string,
  usuarioId: string,
  payload: { assunto: string; mensagem: string },
): Promise<void> {
  await apiFetch(`/areas/${areaId}/responsaveis/${usuarioId}/mensagem`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
