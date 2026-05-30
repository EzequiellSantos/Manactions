import { apiFetch } from "@/lib/api";
import type { AppNotification } from "@/hooks/use-notifications";

interface BackendNotification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string;
  criadoEm: string;
}

function normalizeType(tipo: string): AppNotification["type"] {
  const normalized = tipo.toLowerCase();
  if (normalized.includes("demanda")) return "demanda";
  if (normalized.includes("processo")) return "processo";
  return "aviso";
}

export function relativeNotificationTime(date: Date) {
  const diff = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diff < 60) return `ha ${diff} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `ha ${hours} h`;
  return `ha ${Math.floor(hours / 24)} d`;
}

function normalizeNotification(item: BackendNotification): AppNotification {
  const createdAt = new Date(item.criadoEm);
  return {
    id: item.id,
    title: item.titulo,
    description: item.mensagem,
    read: item.lida,
    type: normalizeType(item.tipo),
    link: item.link,
    createdAt,
    time: relativeNotificationTime(createdAt),
  };
}

export async function getNotifications(): Promise<AppNotification[]> {
  const data = await apiFetch<BackendNotification[]>("/notificacoes");
  return data.map(normalizeNotification);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiFetch("/notificacoes/todas-lidas", { method: "PATCH" });
}

export async function markNotificationAsRead(id: string): Promise<AppNotification> {
  const data = await apiFetch<BackendNotification>(`/notificacoes/${id}/lida`, { method: "PATCH" });
  return normalizeNotification(data);
}
