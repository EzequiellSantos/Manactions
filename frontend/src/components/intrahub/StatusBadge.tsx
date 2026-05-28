import { cn } from "@/lib/utils";

export type StatusDemanda = "aberto" | "em_andamento" | "concluido" | "cancelado";

const STATUS_MAP: Record<StatusDemanda, { label: string; cls: string }> = {
  aberto: {
    label: "Aberto",
    cls: "bg-secondary/10 text-secondary border-secondary/20",
  },
  em_andamento: {
    label: "Em andamento",
    cls: "bg-primary/10 text-primary border-primary/20",
  },
  concluido: {
    label: "Concluído",
    cls: "bg-success/10 text-success border-success/20",
  },
  cancelado: {
    label: "Cancelado",
    cls: "bg-muted text-muted-foreground border-border",
  },
};

interface StatusBadgeProps {
  status: StatusDemanda;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.cls,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
