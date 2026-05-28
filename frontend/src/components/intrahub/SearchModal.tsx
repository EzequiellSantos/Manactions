import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Layers, ListChecks, ArrowRight } from "lucide-react";
import { AREAS, DEMANDAS_RECENTES, getAreaIcon } from "@/lib/mock-data";
import { useNavigate } from "@tanstack/react-router";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = query.toLowerCase().trim();
  const areas = AREAS.filter((a) => !q || a.nome.toLowerCase().includes(q));
  const demandas = DEMANDAS_RECENTES.filter((d) => !q || d.titulo.toLowerCase().includes(q));

  const go = (path: string) => {
    onOpenChange(false);
    navigate({ to: path });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Busca global</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar áreas, demandas, processos..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {areas.length === 0 && demandas.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhum resultado para “{query}”
            </div>
          )}

          {areas.length > 0 && (
            <div className="px-2 py-2">
              <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Layers className="mr-1.5 inline h-3 w-3" /> Áreas
              </div>
              {areas.slice(0, 5).map((a) => {
                const Icon = getAreaIcon(a.icone);
                return (
                  <button
                    key={a.id}
                    onClick={() => go(`/areas/${a.slug}`)}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="flex-1 font-medium">{a.nome}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">{a.descricao}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          )}

          {demandas.length > 0 && (
            <div className="px-2 py-2">
              <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <ListChecks className="mr-1.5 inline h-3 w-3" /> Demandas
              </div>
              {demandas.slice(0, 5).map((d) => (
                <button
                  key={d.id}
                  onClick={() => go("/demandas")}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <FileText className="h-4 w-4 text-secondary" />
                  <span className="flex-1 font-medium">#{d.id} — {d.titulo}</span>
                  <span className="text-xs text-muted-foreground">{d.area}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
