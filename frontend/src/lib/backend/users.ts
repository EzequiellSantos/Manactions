import { apiFetch } from "@/lib/api";

export interface BackendUserListItem {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  avatarUrl?: string;
  papel: string;
  ativo: boolean;
  areaId?: string;
  area?: {
    id: string;
    nome: string;
    slug?: string;
  };
}

export async function getUsers(): Promise<BackendUserListItem[]> {
  return apiFetch<BackendUserListItem[]>("/usuarios");
}
