import { Link } from "@tanstack/react-router";
import { ArrowRight, Eye } from "lucide-react";
import type { ProcessoArea } from "@/lib/types";

function formatDate(date?: Date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

interface ProcessoCardProps {
  processo: ProcessoArea;
  area?: {
    nome: string;
    cor?: string;
  };
}

export function ProcessoCard({ processo, area }: ProcessoCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <span
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: area?.cor ?? "#2563eb" }}
        >
          {area?.nome ?? processo.areaId}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {processo.visualizacoes ?? 0}
        </span>
      </div>
      <h3 className="mt-4 font-display text-base font-semibold">{processo.titulo}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{processo.descricao}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(processo.tags ?? []).slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-xs text-muted-foreground">Atualizado em {formatDate(processo.atualizadoEm)}</span>
        <Link
          to="/processos/$id"
          params={{ id: processo.id }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Abrir
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
