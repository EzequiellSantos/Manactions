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
  recebeDemandas: boolean;
  area?: {
    id: string;
    nome: string;
    slug?: string;
  };
}

export interface AdminUpdateUserPayload {
  papel?: "ADMIN" | "GESTOR" | "COLABORADOR";
  cargo?: string | null;
  departamento?: string | null;
  areaId?: string | null;
  recebeDemandas?: boolean;
}

export async function getUsers(): Promise<BackendUserListItem[]> {
  return apiFetch<BackendUserListItem[]>("/usuarios");
}

export async function deleteUser(id: string): Promise<BackendUserListItem> {
  return apiFetch<BackendUserListItem>(`/usuarios/${id}`, { method: "DELETE" });
}

export async function updateUserRole(id: string, papel: "ADMIN" | "GESTOR" | "COLABORADOR"): Promise<BackendUserListItem> {
  return apiFetch<BackendUserListItem>(`/usuarios/${id}/papel`, {
    method: "PATCH",
    body: JSON.stringify({ papel }),
  });
}

export async function updateUserAdmin(id: string, payload: AdminUpdateUserPayload): Promise<BackendUserListItem> {
  return apiFetch<BackendUserListItem>(`/usuarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
