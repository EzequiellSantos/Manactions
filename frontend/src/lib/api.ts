import { supabase } from "@/integrations/supabase/client";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type ApiEnvelope<T> = {
  data: T;
  message?: string;
  statusCode?: number;
};

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    value != null &&
    typeof value === "object" &&
    "data" in value &&
    "statusCode" in value
  );
}

/**
 * Cliente base para chamadas ao backend NestJS.
 * Anexa automaticamente o token de autenticação Supabase.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const url = API_URL ? `${API_URL.replace(/\/$/, "")}${path}` : path;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text;
    try {
      const errorBody = JSON.parse(text) as { message?: string | string[]; error?: string };
      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join("; ");
      } else {
        message = errorBody.message ?? errorBody.error ?? text;
      }
    } catch {
      message = text;
    }
    throw new ApiError(res.status, message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json()) as T | ApiEnvelope<T>;
  return isApiEnvelope<T>(json) ? json.data : json;
}
