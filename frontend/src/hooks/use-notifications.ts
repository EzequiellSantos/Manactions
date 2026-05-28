import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "demanda" | "aviso" | "processo";
  createdAt: Date;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    title: "Nova demanda atribuída",
    description: "Solicitação de contratação aguardando sua análise.",
    time: "há 5 min",
    read: false,
    type: "demanda",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "2",
    title: "Aprovação pendente",
    description: "Demanda #2487 do Financeiro precisa da sua aprovação.",
    time: "há 1 h",
    read: false,
    type: "demanda",
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Aviso da Diretoria",
    description: "Reunião geral amanhã às 10h no auditório.",
    time: "há 3 h",
    read: false,
    type: "aviso",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "4",
    title: "Processo atualizado",
    description: "POP de Compras teve nova revisão publicada.",
    time: "ontem",
    read: true,
    type: "processo",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

function relativeTime(date: Date) {
  const diff = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diff < 60) return `há ${diff} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.floor(hours / 24)} d`;
}

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<AppNotification[]> => {
      await new Promise((r) => setTimeout(r, 250));
      return MOCK_NOTIFICATIONS;
    },
  });

  useEffect(() => {
    if (query.data) setItems(query.data);
  }, [query.data]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    try {
      channel = supabase
        .channel("in-app-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          (payload) => {
            const row = payload.new as {
              id?: string;
              title?: string;
              description?: string;
              type?: AppNotification["type"];
              read?: boolean;
              created_at?: string;
            };
            const createdAt = row.created_at ? new Date(row.created_at) : new Date();
            const notification: AppNotification = {
              id: row.id ?? crypto.randomUUID(),
              title: row.title ?? "Nova notificação",
              description: row.description ?? "Você recebeu uma nova atualização.",
              type: row.type ?? "aviso",
              read: row.read ?? false,
              createdAt,
              time: relativeTime(createdAt),
            };
            setItems((current) => [notification, ...current].slice(0, 10));
            toast(notification.title, { description: notification.description, position: "bottom-right" });
          },
        )
        .subscribe();
    } catch {
      channel = undefined;
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const data = useMemo(
    () =>
      items
        .map((item) => ({ ...item, time: relativeTime(item.createdAt) }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
    [items],
  );

  return {
    ...query,
    data,
    markAllAsRead: () => setItems((current) => current.map((item) => ({ ...item, read: true }))),
  };
}
