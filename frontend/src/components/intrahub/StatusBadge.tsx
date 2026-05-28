import { CheckCircle2, Circle, Clock3, PlayCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type DemandaStatus } from "@/lib/mock-data";

const STATUS_MAP: Record<DemandaStatus, { label: string; cls: string; icon: typeof Circle }> = {
  aberta: {
    label: "Aberta",
    cls: "bg-secondary/10 text-secondary border-secondary/20",
    icon: Circle,
  },
  em_analise: {
    label: "Em análise",
    cls: "bg-warning/10 text-warning border-warning/20",
    icon: Clock3,
  },
  em_andamento: {
    label: "Em andamento",
    cls: "bg-primary/10 text-primary border-primary/20",
    icon: PlayCircle,
  },
  concluida: {
    label: "Concluída",
    cls: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    cls: "bg-muted text-muted-foreground border-border",
    icon: XCircle,
  },
  rejeitada: {
    label: "Rejeitada",
    cls: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
};

interface StatusBadgeProps {
  status: DemandaStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.cls,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}
