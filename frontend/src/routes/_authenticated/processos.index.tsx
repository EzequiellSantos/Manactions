import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { ProcessoCard } from "@/components/intrahub/ProcessoCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AREAS,
  PROCESSOS,
  PROCESSO_CATEGORIAS,
  PROCESSO_TAGS,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/processos/")({
  head: () => ({ meta: [{ title: "Processos e Base de Conhecimento — IntraHub" }] }),
  component: ProcessosPage,
});

function ProcessosPage() {
  const [query, setQuery] = useState("");
  const [areaId, setAreaId] = useState("todas");
  const [categoria, setCategoria] = useState("todas");
  const [tag, setTag] = useState("todas");

  const processos = useMemo(() => {
    const q = query.toLowerCase().trim();
    return PROCESSOS.filter((processo) => {
      if (q && !`${processo.titulo} ${processo.descricao} ${processo.tags?.join(" ")}`.toLowerCase().includes(q)) return false;
      if (areaId !== "todas" && processo.areaId !== areaId) return false;
      if (categoria !== "todas" && processo.categoria !== categoria) return false;
      if (tag !== "todas" && !(processo.tags ?? []).includes(tag)) return false;
      return true;
    });
  }, [areaId, categoria, query, tag]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Processos e Base de Conhecimento</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulte POPs, fluxos, guias e documentos internos.</p>
        </div>
        <Button type="button" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Processo
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-display text-sm font-semibold">Categorias</h2>
          <Accordion type="single" collapsible className="mt-3">
            {PROCESSO_CATEGORIAS.map((item) => (
              <AccordionItem key={item} value={item}>
                <AccordionTrigger className="text-sm">{item}</AccordionTrigger>
                <AccordionContent>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => setCategoria(item)}
                  >
                    Ver processos de {item}
                  </button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </aside>

        <main className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-soft md:grid-cols-[1fr_180px_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar processo" />
            </div>
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as áreas</SelectItem>
                {AREAS.map((area) => <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas categorias</SelectItem>
                {PROCESSO_CATEGORIAS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas tags</SelectItem>
                {PROCESSO_TAGS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {processos.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Nenhum processo encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {processos.map((processo) => <ProcessoCard key={processo.id} processo={processo} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
