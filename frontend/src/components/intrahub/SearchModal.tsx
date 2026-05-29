import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  FileText,
  Layers,
  ListChecks,
  Search,
  UserRound,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  TODOS_RESPONSAVEIS,
  getAreaById,
  getAreaIcon,
} from "@/lib/mock-data";
import { getAreas } from "@/lib/backend/areas";
import { getDemandas } from "@/lib/backend/demandas";
import { getProcessos } from "@/lib/backend/processos";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResult =
  | { id: string; group: "Áreas"; title: string; description: string; icon: React.ElementType; to: "area"; slug: string }
  | { id: string; group: "Responsáveis"; title: string; description: string; icon: React.ElementType; to: "area"; slug: string }
  | { id: string; group: "Demandas"; title: string; description: string; icon: React.ElementType; to: "demanda"; demandaId: string }
  | { id: string; group: "Processos"; title: string; description: string; icon: React.ElementType; to: "area"; slug: string };

const GROUPS = ["Áreas", "Responsáveis", "Demandas", "Processos"] as const;
const SUGESTOES = ["acesso ao ERP", "reembolso", "benefícios", "contratos"];

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: areas = [] } = useQuery({ queryKey: ["areas"], queryFn: getAreas, enabled: open });
  const { data: demandas = [] } = useQuery({ queryKey: ["demandas"], queryFn: getDemandas, enabled: open });
  const { data: processos = [] } = useQuery({ queryKey: ["processos"], queryFn: getProcessos, enabled: open });
  const responsaveis = useMemo(() => areas.flatMap((area) => area.responsaveis), [areas]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setActiveIndex(0);
      return;
    }
    window.setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const results = useMemo<SearchResult[]>(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return [];

    const areaResults: SearchResult[] = areas.filter((area) =>
      `${area.nome} ${area.descricao} ${area.categoria}`.toLowerCase().includes(q),
    ).map((area) => ({
      id: `area-${area.id}`,
      group: "Áreas",
      title: area.nome,
      description: area.descricao,
      icon: getAreaIcon(area.icone),
      to: "area",
      slug: area.slug,
    }));

    const responsavelResults: SearchResult[] = (responsaveis.length > 0 ? responsaveis : TODOS_RESPONSAVEIS).filter((responsavel) =>
      `${responsavel.nome} ${responsavel.cargo} ${responsavel.email}`.toLowerCase().includes(q),
    ).map((responsavel) => {
      const area = getAreaById(responsavel.areaId);
      return {
        id: `resp-${responsavel.id}`,
        group: "Responsáveis",
        title: responsavel.nome,
        description: `${responsavel.cargo} · ${area?.nome ?? responsavel.areaId}`,
        icon: UserRound,
        to: "area",
        slug: area?.slug ?? "tecnologia-da-informacao",
      };
    });

    const demandaResults: SearchResult[] = demandas.filter((demanda) =>
      `${demanda.id} ${demanda.titulo} ${demanda.descricao} ${demanda.categoria}`.toLowerCase().includes(q),
    ).map((demanda) => ({
      id: `demanda-${demanda.id}`,
      group: "Demandas",
      title: `#${demanda.id} — ${demanda.titulo}`,
      description: getAreaById(demanda.areaId)?.nome ?? demanda.areaId,
      icon: ListChecks,
      to: "demanda",
      demandaId: demanda.id,
    }));

    const processoResults: SearchResult[] = processos
        .filter((processo) => `${processo.titulo} ${processo.descricao} ${processo.categoria}`.toLowerCase().includes(q))
        .map((processo) => {
          const area = areas.find((item) => item.id === processo.areaId) ?? getAreaById(processo.areaId);
          return ({
          id: `processo-${processo.id}`,
          group: "Processos" as const,
          title: processo.titulo,
          description: `${processo.categoria} · ${area?.nome ?? processo.areaId}`,
          icon: FileText,
          to: "area" as const,
          slug: area?.slug ?? "tecnologia-da-informacao",
        });
      });

    return [...areaResults, ...responsavelResults, ...demandaResults, ...processoResults].slice(0, 16);
  }, [areas, debouncedQuery, demandas, processos, responsaveis]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  function openResult(result: SearchResult) {
    onOpenChange(false);
    if (result.to === "demanda") {
      navigate({ to: "/demandas/$id", params: { id: result.demandaId } });
    } else {
      navigate({ to: "/areas/$slug", params: { slug: result.slug } });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, results.length - 1)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      openResult(results[activeIndex]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Busca global</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar áreas, responsáveis, demandas, processos..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[64vh] overflow-y-auto p-2">
          {!debouncedQuery && (
            <div className="px-4 py-5">
              <p className="text-sm font-medium">Sugestões populares</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGESTOES.map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    onClick={() => setQuery(sugestao)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>
          )}

          {debouncedQuery && results.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhum resultado para "{debouncedQuery}"
            </div>
          )}

          {GROUPS.map((group) => {
            const grouped = results.filter((result) => result.group === group);
            if (grouped.length === 0) return null;
            const GroupIcon = group === "Áreas" ? Layers : group === "Responsáveis" ? UserRound : group === "Demandas" ? ListChecks : FileText;
            return (
              <div key={group} className="px-2 py-2">
                <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <GroupIcon className="mr-1.5 inline h-3 w-3" /> {group}
                </div>
                {grouped.map((result) => {
                  const globalIndex = results.findIndex((item) => item.id === result.id);
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                      onClick={() => openResult(result)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
                        activeIndex === globalIndex ? "bg-accent" : "hover:bg-accent",
                      )}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{result.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{result.description}</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
