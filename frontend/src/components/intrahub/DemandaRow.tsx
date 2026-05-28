import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PrioridadeBadge } from "@/components/intrahub/PrioridadeBadge";
import { StatusBadge } from "@/components/intrahub/StatusBadge";
import {
  getAreaById,
  getResponsavelById,
  type Demanda,
} from "@/lib/mock-data";

function formatDate(date?: Date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date);
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface DemandaRowProps {
  demanda: Demanda;
}

export function DemandaRow({ demanda }: DemandaRowProps) {
  const area = getAreaById(demanda.areaId);
  const responsavel = getResponsavelById(demanda.responsavelId);

  return (
    <tr className="group transition hover:bg-accent/50">
      <td className="px-4 py-3 align-middle font-medium">#{demanda.id}</td>
      <td className="px-4 py-3 align-middle">
        <Link to="/demandas/$id" params={{ id: demanda.id }} className="font-medium text-foreground hover:text-primary">
          {demanda.titulo}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{demanda.descricao}</p>
      </td>
      <td className="px-4 py-3 align-middle text-muted-foreground">{area?.nome ?? demanda.areaId}</td>
      <td className="px-4 py-3 align-middle"><PrioridadeBadge prioridade={demanda.prioridade} /></td>
      <td className="px-4 py-3 align-middle"><StatusBadge status={demanda.status} /></td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials(responsavel?.nome)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-32 truncate text-sm text-muted-foreground">{responsavel?.nome ?? "Sem responsável"}</span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle text-xs text-muted-foreground">{formatDate(demanda.criadaEm)}</td>
      <td className="px-4 py-3 align-middle text-xs text-muted-foreground">{formatDate(demanda.prazo)}</td>
      <td className="px-4 py-3 align-middle text-right">
        <Link
          to="/demandas/$id"
          params={{ id: demanda.id }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-primary/10"
        >
          Abrir
          <ArrowRight className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}
