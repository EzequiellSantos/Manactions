import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, FileText, Send, Tag, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PrioridadeBadge } from "@/components/intrahub/PrioridadeBadge";
import { StatusBadge } from "@/components/intrahub/StatusBadge";
import { TimelineEvento } from "@/components/intrahub/TimelineEvento";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getAreas } from "@/lib/backend/areas";
import {
  addDemandaComment,
  assumeDemanda,
  getDemandaById,
  updateDemanda,
  updateDemandaStatus,
} from "@/lib/backend/demandas";
import { getUsers } from "@/lib/backend/users";
import type { DemandaStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/demandas/$id")({
  head: () => ({ meta: [{ title: "Demanda - IntraHub" }] }),
  component: DemandaDetailPage,
});

function formatDate(date?: Date, withTime = false) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function nextStatus(status: DemandaStatus): DemandaStatus | null {
  const map: Partial<Record<DemandaStatus, DemandaStatus>> = {
    aberta: "em_analise",
    em_analise: "em_andamento",
    em_andamento: "concluida",
  };
  return map[status] ?? null;
}

function DemandaDetailPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [comentario, setComentario] = useState("");

  const { data: demanda, isLoading, isError } = useQuery({
    queryKey: ["demandas", id],
    queryFn: () => getDemandaById(id),
    enabled: !loading,
  });
  const { data: areas = [] } = useQuery({ queryKey: ["areas"], queryFn: getAreas, enabled: !loading });
  const { data: usuarios = [] } = useQuery({ queryKey: ["usuarios"], queryFn: getUsers, enabled: !loading });

  const refreshDemandas = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["demandas", id] }),
      queryClient.invalidateQueries({ queryKey: ["demandas"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  };

  const assumeMutation = useMutation({
    mutationFn: () => assumeDemanda(id),
    onSuccess: async () => {
      await refreshDemandas();
      toast.success("Demanda assumida");
    },
    onError: () => toast.error("Nao foi possivel assumir a demanda"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, comentario: motivo }: { status: DemandaStatus; comentario?: string }) =>
      updateDemandaStatus(id, status, motivo),
    onSuccess: async () => {
      await refreshDemandas();
      toast.success("Status atualizado");
    },
    onError: () => toast.error("Nao foi possivel atualizar o status"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { titulo?: string; prazo?: string }) => updateDemanda(id, payload),
    onSuccess: async () => {
      await refreshDemandas();
      toast.success("Demanda atualizada");
    },
    onError: () => toast.error("Nao foi possivel atualizar a demanda"),
  });

  const commentMutation = useMutation({
    mutationFn: (texto: string) => addDemandaComment(id, texto),
    onSuccess: async () => {
      setComentario("");
      await refreshDemandas();
      toast.success("Comentario enviado");
    },
    onError: () => toast.error("Nao foi possivel enviar o comentario"),
  });

  if (isLoading) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Carregando demanda...</div>;
  }

  if (isError || !demanda) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-destructive/30 bg-card p-8 text-sm text-destructive">Nao foi possivel carregar esta demanda do backend.</div>;
  }

  const demandaAtual = demanda;
  const area = areas.find((item) => item.id === demandaAtual.areaId);
  const responsavel = area?.responsaveis.find((item) => item.id === demandaAtual.responsavelId);
  const solicitante = usuarios.find((item) => item.id === demandaAtual.solicitanteId);
  const isSolicitante = demandaAtual.solicitanteId === user?.id;
  const isResponsavel = demandaAtual.responsavelId === user?.id || area?.responsaveis.some((item) => item.id === user?.id);
  const autores = new Map([
    ...usuarios.map((item) => [item.id, item.nome] as const),
    ...(area?.responsaveis ?? []).map((item) => [item.id, item.nome] as const),
  ]);

  function editTitle() {
    const titulo = window.prompt("Novo titulo da demanda", demandaAtual.titulo);
    if (!titulo || titulo.trim() === demandaAtual.titulo) return;
    updateMutation.mutate({ titulo: titulo.trim() });
  }

  function addDeadline() {
    const prazo = window.prompt("Informe o novo prazo no formato AAAA-MM-DD");
    if (!prazo) return;
    updateMutation.mutate({ prazo });
  }

  function advanceStatus() {
    const status = nextStatus(demandaAtual.status);
    if (!status) {
      toast.info("Esta demanda nao possui proxima transicao disponivel.");
      return;
    }
    statusMutation.mutate({ status });
  }

  function sendComment() {
    if (!comentario.trim()) return;
    commentMutation.mutate(comentario.trim());
  }

  function DestructiveAction({ label, onConfirm }: { label: string; onConfirm: () => void }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive">{label}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar acao</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao altera o andamento da demanda e sera registrada no historico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>{label}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Button asChild variant="ghost" className="gap-2 px-0">
        <Link to="/demandas">
          <ArrowLeft className="h-4 w-4" />
          Voltar para demandas
        </Link>
      </Button>

      <header className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-soft lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-semibold text-muted-foreground">#{demanda.id}</span>
            <StatusBadge status={demanda.status} />
            <PrioridadeBadge prioridade={demanda.prioridade} />
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">{demanda.titulo}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{area?.nome ?? demanda.areaId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSolicitante && demanda.status === "aberta" && (
            <>
              <Button type="button" variant="outline" disabled={updateMutation.isPending} onClick={editTitle}>Editar</Button>
              <DestructiveAction label="Cancelar" onConfirm={() => statusMutation.mutate({ status: "cancelada", comentario: "Cancelada pelo solicitante" })} />
            </>
          )}
          {isResponsavel && (
            <>
              <Button type="button" variant="outline" disabled={assumeMutation.isPending} onClick={() => assumeMutation.mutate()}>Assumir</Button>
              <Button type="button" variant="outline" disabled={statusMutation.isPending} onClick={advanceStatus}>Alterar Status</Button>
              <Button type="button" variant="outline" disabled={updateMutation.isPending} onClick={addDeadline}>Adicionar Prazo</Button>
              {demanda.status === "em_andamento" && (
                <Button type="button" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ status: "concluida" })}>Resolver</Button>
              )}
              {demanda.status === "em_analise" && (
                <DestructiveAction label="Rejeitar" onConfirm={() => statusMutation.mutate({ status: "rejeitada", comentario: "Rejeitada pelo responsavel" })} />
              )}
            </>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <main className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Descricao</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{demanda.descricao}</p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Anexos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(demanda.anexos ?? []).map((anexo) => (
                <div key={anexo.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{anexo.nome}</p>
                    <p className="text-xs text-muted-foreground">{anexo.tipo} - {anexo.tamanho}</p>
                  </div>
                </div>
              ))}
              {(demanda.anexos ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nenhum anexo enviado.</p>}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Historico</h2>
            <div className="mt-5">
              {demanda.historico.map((evento) => (
                <TimelineEvento key={evento.id} evento={evento} autorNome={autores.get(evento.autorId)} />
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Adicionar Comentario</h2>
            <Textarea className="mt-4" rows={5} value={comentario} onChange={(event) => setComentario(event.target.value)} placeholder="Escreva uma atualizacao ou duvida..." />
            <Button type="button" className="mt-3 gap-2" disabled={commentMutation.isPending} onClick={sendComment}>
              <Send className="h-4 w-4" />
              {commentMutation.isPending ? "Enviando..." : "Enviar comentario"}
            </Button>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Informacoes da Demanda</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Area</dt><dd className="font-medium">{area?.nome ?? demanda.areaId}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Categoria</dt><dd className="font-medium">{demanda.categoria || demanda.tags?.[0] || "-"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Criado por</dt><dd className="font-medium">{solicitante?.nome ?? demanda.solicitanteId}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Criacao</dt><dd className="font-medium">{formatDate(demanda.criadaEm, true)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Prazo</dt><dd className="font-medium">{formatDate(demanda.prazo)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Atualizacao</dt><dd className="font-medium">{formatDate(demanda.atualizadaEm, true)}</dd></div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Responsavel Atual</h2>
            <div className="mt-4 flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {initials(responsavel?.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium">{responsavel?.nome ?? "Sem responsavel"}</p>
                <p className="text-xs text-muted-foreground">{responsavel?.cargo ?? "Aguardando triagem"}</p>
              </div>
            </div>
            <Button type="button" variant="outline" className="mt-4 w-full gap-2" disabled>
              <UserRound className="h-4 w-4" />
              Reatribuir
            </Button>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Tags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(demanda.tags ?? []).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
              {(demanda.tags ?? []).length === 0 && <span className="text-sm text-muted-foreground">Sem tags.</span>}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <CalendarClock className="h-4 w-4" />
              SLA
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">Prazos e regras de atendimento serao calculados pelo backend.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
