import { useNavigate } from "@tanstack/react-router";
import { Bell, ClipboardList, FileText, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotifications, type AppNotification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const ICONS = {
  demanda: FileText,
  aviso: Megaphone,
  processo: ClipboardList,
};

function getInternalPath(link?: string) {
  if (!link) return "";
  try {
    const url = new URL(link, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return link.startsWith("/") ? link : "";
  }
}

function Item({ n, onOpen }: { n: AppNotification; onOpen: (notification: AppNotification) => void }) {
  const Icon = ICONS[n.type];
  return (
    <button
      type="button"
      className={cn("flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-accent", !n.read && "bg-primary/5")}
      onClick={() => onOpen(n)}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight text-foreground">{n.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.description}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
      </div>
      {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </button>
  );
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading, markAllAsRead, markAsRead } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  async function openNotification(notification: AppNotification) {
    await markAsRead(notification.id);
    const path = getInternalPath(notification.link);
    if (path) {
      await navigate({ to: path });
    }
  }

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Notificações</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] p-0 sm:w-[360px]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="font-display text-sm font-semibold">Notificações</p>
          {unread > 0 && (
            <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={markAllAsRead}>
              Marcar todas como lidas
            </button>
          )}
        </div>
        <div className="max-h-[420px] space-y-1 overflow-y-auto p-2">
          {isLoading && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">Carregando...</p>
          )}
          {!isLoading && notifications.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              Você está em dia! Sem novas notificações.
            </p>
          )}
          {notifications.map((n) => (
            <Item key={n.id} n={n} onOpen={openNotification} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
