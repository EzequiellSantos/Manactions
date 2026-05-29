import { apiFetch } from "@/lib/api";

export interface BuscaGlobalResponse {
  areas: Array<{
    id: string;
    nome: string;
    slug: string;
    descricao: string;
    categoria: string;
  }>;
  usuarios: Array<{
    id: string;
    nome: string;
    email: string;
    cargo?: string;
    avatarUrl?: string;
  }>;
  demandas: Array<{
    id: string;
    titulo: string;
    descricao: string;
    status: string;
    prioridade: string;
  }>;
  processos: Array<{
    id: string;
    titulo: string;
    slug: string;
    descricao: string;
    categoria: string;
  }>;
  total: number;
}

export const EMPTY_SEARCH_RESPONSE: BuscaGlobalResponse = {
  areas: [],
  usuarios: [],
  demandas: [],
  processos: [],
  total: 0,
};

export async function searchGlobal(query: string): Promise<BuscaGlobalResponse> {
  const q = query.trim();
  if (!q) return EMPTY_SEARCH_RESPONSE;

  return apiFetch<BuscaGlobalResponse>(`/busca?q=${encodeURIComponent(q)}`);
}
