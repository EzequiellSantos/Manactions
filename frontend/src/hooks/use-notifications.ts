import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getNotifications,
  markAllNotificationsAsRead,
  relativeNotificationTime,
} from "@/lib/backend/notifications";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "demanda" | "aviso" | "processo";
  createdAt: Date;
}

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const initializedRef = useRef(false);
  const previousIdsRef = useRef(new Set<string>());
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!query.data) return;

    const incoming = query.data;
    setItems(incoming);

    if (initializedRef.current) {
      incoming
        .filter((item) => !item.read && !previousIdsRef.current.has(item.id))
        .forEach((item) => {
          toast(item.title, { description: item.description, position: "bottom-right" });
        });
    }

    previousIdsRef.current = new Set(incoming.map((item) => item.id));
    initializedRef.current = true;
  }, [query.data]);

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => {
      setItems((current) => current.map((item) => ({ ...item, read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const data = useMemo(
    () =>
      items
        .map((item) => ({ ...item, time: relativeNotificationTime(item.createdAt) }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
    [items],
  );

  return {
    ...query,
    data,
    markAllAsRead: () => markAllMutation.mutate(),
  };
}
