import { apiFetch } from "@/lib/api";
import type { Area } from "@/lib/mock-data";
import { normalizeArea } from "@/lib/backend/normalizers";

export async function getAreas(): Promise<Area[]> {
  const data = await apiFetch<unknown[]>("/areas");
  return data.map(normalizeArea);
}

export async function getAreaBySlugFromApi(slug: string): Promise<Area> {
  return normalizeArea(await apiFetch<unknown>(`/areas/${slug}`));
}
