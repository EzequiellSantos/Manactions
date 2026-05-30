import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Eye, Loader2, Pencil, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProcessoCard } from "@/components/intrahub/ProcessoCard";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { getAreas } from "@/lib/backend/areas";
import { deleteProcesso, getProcessoByIdFromApi, getProcessos, publishProcesso, updateProcesso } from "@/lib/backend/processos";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/processos/$id")({
  head: () => ({ meta: [{ title: "Processo — Manactions" }] }),
  component: ProcessoDetailPage,
});

function formatDate(date?: Date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function MarkdownLite({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-sm leading-6 text-muted-foreground">
      {content.split("\n\n").map((block) => {
        if (block.startsWith("## ")) {
          return <h2 key={block} className="font-display text-lg font-semibold text-foreground">{block.replace("## ", "")}</h2>;
        }
        if (block.includes("\n1.")) {
          return <p key={block} className="whitespace-pre-line">{block}</p>;
        }
        return <p key={block} className="whitespace-pre-line">{block}</p>;
      })}
    </div>
  );
}

function ProcessoDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loading } = useAuth();
  const { areaId: currentAreaId, isAdmin, isGestor } = usePermissions();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({
    titulo: "",
    descricao: "",
    conteudo: "",
    areaId: "",
    categoria: "",
    tags: "",
    publicado: true,
  });
  const { data: processo, isLoading, isError } = useQuery({
    queryKey: ["processos", id],
    queryFn: () => getProcessoByIdFromApi(id),
    enabled: !loading,
  });
  const { data: processos = [] } = useQuery({
    queryKey: ["processos"],
    queryFn: getProcessos,
    enabled: !loading,
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
    enabled: !loading,
  });
  const publishMutation = useMutation({
    mutationFn: () => publishProcesso(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["processos", id] }),
        queryClient.invalidateQueries({ queryKey: ["processos"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      toast.success("Processo publicado");
    },
    onError: () => toast.error("Nao foi possivel publicar o processo"),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteProcesso(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["processos"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      toast.success("Processo removido");
      navigate({ to: "/processos" });
    },
    onError: () => toast.error("Nao foi possivel remover o processo"),
  });
  const updateMutation = useMutation({
    mutationFn: () => updateProcesso(id, {
      titulo: draft.titulo.trim(),
      descricao: draft.descricao.trim(),
      conteudo: draft.conteudo.trim(),
      areaId: draft.areaId,
      categoria: draft.categoria.trim(),
      publicado: draft.publicado,
      tags: draft.tags.split(",").map((item) => item.trim()).filter(Boolean),
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["processos", id] }),
        queryClient.invalidateQueries({ queryKey: ["processos"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setEditOpen(false);
      toast.success("Processo atualizado");
    },
    onError: () => toast.error("Nao foi possivel atualizar o processo"),
  });

  if (isLoading) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Carregando processo...</div>;
  }

  if (isError || !processo) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-destructive/30 bg-card p-8 text-sm text-destructive">Não foi possível carregar este processo do backend.</div>;
  }

  const area = areas.find((item) => item.id === processo.areaId);
  const canEdit = isAdmin || (isGestor && currentAreaId === processo.areaId);
  const manageableAreas = isAdmin ? areas : areas.filter((item) => item.id === currentAreaId);
  const relacionados = (processo.relacionados ?? [])
    .map((relatedId) => processos.find((item) => item.id === relatedId))
    .filter(Boolean);

  function openEditDialog() {
    setDraft({
      titulo: processo.titulo,
      descricao: processo.descricao,
      conteudo: processo.conteudo ?? processo.descricao,
      areaId: processo.areaId,
      categoria: processo.categoria,
      tags: (processo.tags ?? []).join(", "),
      publicado: true,
    });
    setEditOpen(true);
  }

  function submitEdit() {
    if (!draft.titulo.trim() || !draft.descricao.trim() || !draft.conteudo.trim() || !draft.areaId || !draft.categoria.trim()) {
      toast.error("Preencha titulo, area, categoria, descricao e conteudo.");
      return;
    }
    updateMutation.mutate();
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Button asChild variant="ghost" className="gap-2 px-0">
        <Link to="/processos">
          <ArrowLeft className="h-4 w-4" />
          Voltar para processos
        </Link>
      </Button>

      <nav className="text-sm text-muted-foreground">
        <Link to="/processos" className="hover:text-foreground">Processos</Link>
        <span className="mx-2">/</span>
        <span>{area?.nome}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{processo.titulo}</span>
      </nav>

      <header className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="font-display text-3xl font-bold tracking-tight">{processo.titulo}</h1>
          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="gap-2" disabled={updateMutation.isPending} onClick={openEditDialog}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              {isAdmin && (
                <>
              <Button type="button" variant="outline" className="gap-2" disabled={publishMutation.isPending} onClick={() => publishMutation.mutate()}>
                {publishMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Publicar
              </Button>
              <Button type="button" variant="destructive" className="gap-2" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Excluir
              </Button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{area?.nome}</span>
          <span>Autor: {processo.autor}</span>
          <span>Versão {processo.versao}</span>
          <span>Atualizado em {formatDate(processo.atualizadoEm)}</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {processo.visualizacoes} visualizações</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <main className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <MarkdownLite content={processo.conteudo ?? processo.descricao} />
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Arquivos e documentos</h2>
            <div className="mt-4 space-y-2">
              {(processo.documentos ?? []).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                  <div>
                    <p className="text-sm font-medium">{doc.nome}</p>
                    <p className="text-xs text-muted-foreground">{doc.tipo} · {doc.tamanho}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Baixar
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Este processo foi útil?</h2>
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" className="gap-2" onClick={() => toast.success("Obrigado pelo feedback!")}>
                <ThumbsUp className="h-4 w-4" />
                Sim
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={() => toast.info("Obrigado, vamos revisar.")}>
                <ThumbsDown className="h-4 w-4" />
                Não
              </Button>
            </div>
          </section>
          <Button
            type="button"
            className="w-full"
            onClick={() => navigate({ to: "/demandas/nova", search: { area: processo.areaId } as never })}
          >
            Abrir Demanda Relacionada
          </Button>
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Processos Relacionados</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relacionados.length > 0
            ? relacionados.map((item) => item && <ProcessoCard key={item.id} processo={item} area={areas.find((areaItem) => areaItem.id === item.areaId)} />)
            : processos
                .filter((item) => item.areaId === processo.areaId && item.id !== processo.id)
                .slice(0, 3)
                .map((item) => <ProcessoCard key={item.id} processo={item} area={areas.find((areaItem) => areaItem.id === item.areaId)} />)}
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Editar Processo</DialogTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              value={draft.titulo}
              onChange={(event) => setDraft((current) => ({ ...current, titulo: event.target.value }))}
              placeholder="Titulo"
            />
            <Select value={draft.areaId} onValueChange={(value) => setDraft((current) => ({ ...current, areaId: value }))}>
              <SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger>
              <SelectContent>
                {manageableAreas.map((areaItem) => <SelectItem key={areaItem.id} value={areaItem.id}>{areaItem.nome}</SelectItem>)}
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
              disabled={!isAdmin}
            />
            Publicado
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button type="button" className="gap-2" disabled={updateMutation.isPending} onClick={submitEdit}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {updateMutation.isPending ? "Salvando..." : "Salvar Alteracoes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
