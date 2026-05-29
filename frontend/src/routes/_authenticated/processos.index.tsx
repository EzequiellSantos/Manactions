import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { getAreas } from "@/lib/backend/areas";
import { createProcesso, getProcessoCategorias, getProcessos } from "@/lib/backend/processos";

export const Route = createFileRoute("/_authenticated/processos/")({
  head: () => ({ meta: [{ title: "Processos e Base de Conhecimento - IntraHub" }] }),
  component: ProcessosPage,
});

function ProcessosPage() {
  const [query, setQuery] = useState("");
  const [areaId, setAreaId] = useState("todas");
  const [categoria, setCategoria] = useState("todas");
  const [tag, setTag] = useState("todas");
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState({
    titulo: "",
    descricao: "",
    conteudo: "",
    areaId: "",
    categoria: "",
    tags: "",
    publicado: true,
  });
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const role = user?.user_metadata?.role;
  const canManage = role === "admin" || role === "gestor";

  const { data: allProcessos = [], isLoading, isError } = useQuery({
    queryKey: ["processos"],
    queryFn: getProcessos,
    enabled: !loading,
  });
  const { data: categoriasBackend = [] } = useQuery({
    queryKey: ["processos", "categorias"],
    queryFn: getProcessoCategorias,
    enabled: !loading,
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
    enabled: !loading,
  });

  const createMutation = useMutation({
    mutationFn: createProcesso,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["processos"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setNewOpen(false);
      setDraft({ titulo: "", descricao: "", conteudo: "", areaId: "", categoria: "", tags: "", publicado: true });
      toast.success("Processo criado");
    },
    onError: () => toast.error("Nao foi possivel criar o processo"),
  });

  const categorias = useMemo(
    () => categoriasBackend.length > 0 ? categoriasBackend : Array.from(new Set(allProcessos.map((processo) => processo.categoria))),
    [allProcessos, categoriasBackend],
  );
  const tags = useMemo(() => Array.from(new Set(allProcessos.flatMap((processo) => processo.tags ?? []))), [allProcessos]);

  const processos = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allProcessos.filter((processo) => {
      if (q && !`${processo.titulo} ${processo.descricao} ${processo.tags?.join(" ")}`.toLowerCase().includes(q)) return false;
      if (areaId !== "todas" && processo.areaId !== areaId) return false;
      if (categoria !== "todas" && processo.categoria !== categoria) return false;
      if (tag !== "todas" && !(processo.tags ?? []).includes(tag)) return false;
      return true;
    });
  }, [allProcessos, areaId, categoria, query, tag]);

  function submitProcesso() {
    if (!draft.titulo.trim() || !draft.descricao.trim() || !draft.conteudo.trim() || !draft.areaId || !draft.categoria.trim()) {
      toast.error("Preencha titulo, area, categoria, descricao e conteudo.");
      return;
    }

    createMutation.mutate({
      titulo: draft.titulo.trim(),
      descricao: draft.descricao.trim(),
      conteudo: draft.conteudo.trim(),
      areaId: draft.areaId,
      categoria: draft.categoria.trim(),
      publicado: draft.publicado,
      tags: draft.tags.split(",").map((item) => item.trim()).filter(Boolean),
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Processos e Base de Conhecimento</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulte POPs, fluxos, guias e documentos internos.</p>
        </div>
        {canManage && (
          <Button type="button" className="gap-2" onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Processo
          </Button>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-display text-sm font-semibold">Categorias</h2>
          <Accordion type="single" collapsible className="mt-3">
            {categorias.map((item) => (
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
                <SelectItem value="todas">Todas as areas</SelectItem>
                {areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas categorias</SelectItem>
                {categorias.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas tags</SelectItem>
                {tags.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Carregando processos...
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/30 bg-card p-10 text-center text-sm text-destructive">
              Nao foi possivel carregar os processos do backend.
            </div>
          ) : processos.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Nenhum processo encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {processos.map((processo) => (
                <ProcessoCard
                  key={processo.id}
                  processo={processo}
                  area={areas.find((area) => area.id === processo.areaId)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Novo Processo</DialogTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              value={draft.titulo}
              onChange={(event) => setDraft((current) => ({ ...current, titulo: event.target.value }))}
              placeholder="Titulo"
            />
            <Select value={draft.areaId} onValueChange={(value) => setDraft((current) => ({ ...current, areaId: value }))}>
              <SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger>
              <SelectContent>
                {areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              value={draft.categoria}
              onChange={(event) => setDraft((current) => ({ ...current, categoria: event.target.value }))}
              placeholder="Categoria"
            />
            <Input
              value={draft.tags}
              onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
              placeholder="Tags separadas por virgula"
            />
          </div>
          <Textarea
            value={draft.descricao}
            onChange={(event) => setDraft((current) => ({ ...current, descricao: event.target.value }))}
            placeholder="Descricao curta"
            rows={3}
          />
          <Textarea
            value={draft.conteudo}
            onChange={(event) => setDraft((current) => ({ ...current, conteudo: event.target.value }))}
            placeholder="Conteudo em markdown"
            rows={8}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.publicado}
              onChange={(event) => setDraft((current) => ({ ...current, publicado: event.target.checked }))}
            />
            Publicar imediatamente
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button type="button" className="gap-2" disabled={createMutation.isPending} onClick={submitProcesso}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createMutation.isPending ? "Salvando..." : "Salvar Processo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
