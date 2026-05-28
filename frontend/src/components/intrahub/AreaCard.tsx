import { Link } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { motion } from "motion/react";
import { getAreaIcon, type Area } from "@/lib/mock-data";

interface AreaCardProps {
  area: Area;
  index?: number;
}

export function AreaCard({ area, index = 0 }: AreaCardProps) {
  const Icon = getAreaIcon(area.icone);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: area.cor }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {area.categoria}
          </p>
          <h3 className="mt-1 font-display text-base font-semibold text-foreground">
            {area.nome}
          </h3>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{area.descricao}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Users className="h-4 w-4" />
          {area.responsaveis.length} responsáveis
        </div>
        <Link
          to="/areas/$slug"
          params={{ slug: area.slug }}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-primary transition hover:bg-primary/10"
        >
          Ver Área
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}
