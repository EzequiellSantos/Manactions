import { apiFetch } from "@/lib/api";

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  telefone?: string;
  preferencias?: {
    email: boolean;
    inApp: boolean;
  };
}

export async function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/usuarios/me");
}

export async function updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  return apiFetch<UserProfile>("/usuarios/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
