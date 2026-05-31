import { CheckCircle2, CircleDot, MessageSquare, Pencil, UserCheck, XCircle } from "lucide-react";
import type { EventoHistorico } from "@/lib/types";

const EVENT_ICON: Record<string, typeof CircleDot> = {
  criada: CircleDot,
  assumida: UserCheck,
  status: CheckCircle2,
  comentario: MessageSquare,
  resolvida: CheckCircle2,
  cancelada: XCircle,
  rejeitada: XCircle,
  DEMANDA_EDITADA: Pencil,
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface TimelineEventoProps {
  evento: EventoHistorico;
  autorNome?: string;
}

export function TimelineEvento({ evento, autorNome }: TimelineEventoProps) {
  const Icon = EVENT_ICON[evento.tipo] ?? CircleDot;
  const isComentario = evento.tipo.toLowerCase().includes("comentario");

  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      <div className="absolute left-4 top-9 h-[calc(100%-2rem)] w-px bg-border last:hidden" />
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        {isComentario ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Comentario</p>
            <p className="mt-2 whitespace-pre-line rounded-lg border border-border bg-surface p-3 text-sm leading-6 text-foreground">
              {evento.descricao}
            </p>
          </>
        ) : (
          <p className="text-sm font-medium text-foreground">{evento.descricao}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {autorNome ?? "Sistema"} - {formatDateTime(evento.criadoEm)}
        </p>
      </div>
    </div>
  );
}
