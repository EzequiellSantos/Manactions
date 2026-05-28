import { AlertTriangle, ChevronsUp, Minus, Signal } from "lucide-react";
import { cn } from "@/lib/utils";
import { type PrioridadeDemanda } from "@/lib/mock-data";

const PRIORIDADE_MAP: Record<PrioridadeDemanda, { label: string; cls: string; icon: typeof Minus }> = {
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground border-border", icon: Minus },
  media: { label: "Média", cls: "bg-primary/10 text-primary border-primary/20", icon: Signal },
  alta: { label: "Alta", cls: "bg-warning/10 text-warning border-warning/20", icon: ChevronsUp },
  urgente: { label: "Urgente", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

interface PrioridadeBadgeProps {
  prioridade: PrioridadeDemanda;
  className?: string;
}

export function PrioridadeBadge({ prioridade, className }: PrioridadeBadgeProps) {
  const cfg = PRIORIDADE_MAP[prioridade];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.cls, className)}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}
