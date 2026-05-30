import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
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
  link?: string;
}

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const initializedRef = useRef(false);
  const previousIdsRef = useRef(new Set<string>());
  const queryClient = useQueryClient();
  const { loading } = useAuth();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !loading,
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

  const markOneMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: (id) => {
      setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
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
    markAsRead: (id: string) => markOneMutation.mutateAsync(id),
  };
}
