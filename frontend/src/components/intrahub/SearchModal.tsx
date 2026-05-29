import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  FileText,
  Layers,
  ListChecks,
  Search,
  UserRound,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EMPTY_SEARCH_RESPONSE, searchGlobal } from "@/lib/backend/search";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResult =
  | { id: string; group: "Areas"; title: string; description: string; icon: React.ElementType; to: "area"; slug: string }
  | { id: string; group: "Responsaveis"; title: string; description: string; icon: React.ElementType; to: "usuario" }
  | { id: string; group: "Demandas"; title: string; description: string; icon: React.ElementType; to: "demanda"; demandaId: string }
  | { id: string; group: "Processos"; title: string; description: string; icon: React.ElementType; to: "processo"; processoId: string };

const GROUPS = ["Areas", "Responsaveis", "Demandas", "Processos"] as const;
const SUGESTOES = ["acesso ao ERP", "reembolso", "beneficios", "contratos"];

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data = EMPTY_SEARCH_RESPONSE } = useQuery({
    queryKey: ["busca-global", debouncedQuery],
    queryFn: () => searchGlobal(debouncedQuery),
    enabled: open && debouncedQuery.trim().length > 0,
  });

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
    const q = debouncedQuery.trim();
    if (!q) return [];

    const areaResults: SearchResult[] = data.areas.map((area) => ({
      id: `area-${area.id}`,
      group: "Areas",
      title: area.nome,
      description: `${area.categoria} - ${area.descricao}`,
      icon: Layers,
      to: "area",
      slug: area.slug,
    }));

    const responsavelResults: SearchResult[] = data.usuarios.map((usuario) => ({
      id: `usuario-${usuario.id}`,
      group: "Responsaveis",
      title: usuario.nome,
      description: `${usuario.cargo ?? "Usuario"} - ${usuario.email}`,
      icon: UserRound,
      to: "usuario",
    }));

    const demandaResults: SearchResult[] = data.demandas.map((demanda) => ({
      id: `demanda-${demanda.id}`,
      group: "Demandas",
      title: `#${demanda.id} - ${demanda.titulo}`,
      description: `${demanda.status} - ${demanda.prioridade}`,
      icon: ListChecks,
      to: "demanda",
      demandaId: demanda.id,
    }));

    const processoResults: SearchResult[] = data.processos.map((processo) => ({
      id: `processo-${processo.id}`,
      group: "Processos",
      title: processo.titulo,
      description: `${processo.categoria} - ${processo.descricao}`,
      icon: FileText,
      to: "processo",
      processoId: processo.id,
    }));

    return [...areaResults, ...responsavelResults, ...demandaResults, ...processoResults].slice(0, 16);
  }, [data, debouncedQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  function openResult(result: SearchResult) {
    onOpenChange(false);
    if (result.to === "demanda") {
      navigate({ to: "/demandas/$id", params: { id: result.demandaId } });
      return;
    }
    if (result.to === "processo") {
      navigate({ to: "/processos/$id", params: { id: result.processoId } });
      return;
    }
    if (result.to === "usuario") {
      navigate({ to: "/perfil" });
      return;
    }
    navigate({ to: "/areas/$slug", params: { slug: result.slug } });
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
            placeholder="Buscar areas, responsaveis, demandas, processos..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[64vh] overflow-y-auto p-2">
          {!debouncedQuery && (
            <div className="px-4 py-5">
              <p className="text-sm font-medium">Sugestoes populares</p>
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
            const GroupIcon = group === "Areas" ? Layers : group === "Responsaveis" ? UserRound : group === "Demandas" ? ListChecks : FileText;
            return (
              <div key={group} className="px-2 py-2">
                <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <GroupIcon className="mr-1.5 inline h-3 w-3" /> {group}
                </div>
                {grouped.map((result) => {
                  const globalIndex = results.findIndex((item) => item.id === result.id);
                  const Icon = result.icon ?? Briefcase;
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
