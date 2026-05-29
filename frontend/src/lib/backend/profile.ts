import { apiFetch } from "@/lib/api";

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  telefone?: string;
  avatarUrl?: string;
  notificacoesEmail?: boolean;
  notificacoesInApp?: boolean;
}

export interface UpdateProfilePayload {
  nome?: string;
  cargo?: string;
  departamento?: string;
  telefone?: string;
  avatarUrl?: string;
  notificacoesEmail?: boolean;
  notificacoesInApp?: boolean;
}

export async function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/usuarios/me");
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return apiFetch<UserProfile>("/usuarios/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
