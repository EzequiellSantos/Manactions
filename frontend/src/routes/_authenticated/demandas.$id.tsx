import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, Send, Tag, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PrioridadeBadge } from "@/components/intrahub/PrioridadeBadge";
import { StatusBadge } from "@/components/intrahub/StatusBadge";
import { TimelineEvento } from "@/components/intrahub/TimelineEvento";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  assignDemanda,
  assumeDemanda,
  getDemandaById,
  updateDemanda,
  updateDemandaStatus,
} from "@/lib/backend/demandas";
import { getUsers } from "@/lib/backend/users";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DemandaStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/demandas/$id")({
  head: () => ({ meta: [{ title: "Demanda - Manactions" }] }),
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

const DEMANDA_STATUS_OPTIONS: DemandaStatus[] = ["aberta", "em_analise", "em_andamento", "concluida", "cancelada", "rejeitada"];

function DemandaDetailPage() {
  const { id } = Route.useParams();
  const { loading } = useAuth();
  const { currentUser, canManageDemanda, canReassignDemanda } = usePermissions();
  const queryClient = useQueryClient();
  const [comentario, setComentario] = useState("");
  const [selectedResponsavelId, setSelectedResponsavelId] = useState("");
  const [statusDraft, setStatusDraft] = useState<DemandaStatus>("aberta");
  const [prazoResolucaoDraft, setPrazoResolucaoDraft] = useState("");

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

  const assignMutation = useMutation({
    mutationFn: (responsavelId: string) => assignDemanda(id, responsavelId),
    onSuccess: async () => {
      setSelectedResponsavelId("");
      await refreshDemandas();
      toast.success("Demanda atribuida");
    },
    onError: () => toast.error("Nao foi possivel atribuir a demanda"),
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
    mutationFn: (payload: { titulo?: string; prazo?: string; prazoResolucao?: string }) => updateDemanda(id, payload),
    onSuccess: async () => {
      await refreshDemandas();
      toast.success("Demanda atualizada");
    },
    onError: () => toast.error("Nao foi possivel atualizar a demanda"),
  });

  useEffect(() => {
    if (!demanda) return;
    setStatusDraft(demanda.status);
    setPrazoResolucaoDraft(demanda.prazoResolucao ? demanda.prazoResolucao.toISOString().slice(0, 10) : "");
  }, [demanda?.id, demanda?.prazoResolucao, demanda?.status]);

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
  const comentarioIds = new Set(demandaAtual.comentarios.map((comentario) => comentario.id));
  const timelineEventos = [
    ...demandaAtual.historico.filter((evento) => {
      const comentarioId = evento.metadados?.comentarioId;
      return typeof comentarioId !== "string" || !comentarioIds.has(comentarioId);
    }),
    ...demandaAtual.comentarios.map((comentario) => ({
      id: `comentario-${comentario.id}`,
      tipo: "comentario",
      descricao: comentario.texto,
      autorId: comentario.autorId,
      criadoEm: comentario.criadoEm,
      metadados: { comentarioId: comentario.id },
    })),
  ].sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime());
  const isSolicitante = demandaAtual.solicitanteId === currentUser?.id;
  const isResponsavelAtual = demandaAtual.responsavelId === currentUser?.id;
  const isResponsavelDaArea = area?.responsaveis.some((item) => item.id === currentUser?.id) ?? false;
  const isResponsavel = isResponsavelAtual || isResponsavelDaArea;
  const canAssumir = isResponsavelDaArea && !isResponsavelAtual;
  const canManageAtendimento = canManageDemanda(demandaAtual);
  const canShowTriagem = canReassignDemanda(demandaAtual);
  const responsaveisDisponiveis = usuarios.filter((usuario) =>
    usuario.ativo &&
    usuario.recebeDemandas &&
    usuario.areaId === demandaAtual.areaId &&
    canReassignDemanda(demandaAtual, usuario)
  );
  const autores = new Map([
    ...usuarios.map((item) => [item.id, item.nome] as const),
    ...(area?.responsaveis ?? []).map((item) => [item.id, item.nome] as const),
  ]);

  function editTitle() {
    const titulo = window.prompt("Novo titulo da demanda", demandaAtual.titulo);
    if (!titulo || titulo.trim() === demandaAtual.titulo) return;
    updateMutation.mutate({ titulo: titulo.trim() });
  }

  async function saveDemandControl() {
    const updates: Promise<unknown>[] = [];
    if (statusDraft !== demandaAtual.status) {
      updates.push(statusMutation.mutateAsync({ status: statusDraft }));
    }
    const currentPrazoResolucao = demandaAtual.prazoResolucao ? demandaAtual.prazoResolucao.toISOString().slice(0, 10) : "";
    if (prazoResolucaoDraft !== currentPrazoResolucao && prazoResolucaoDraft) {
      updates.push(updateMutation.mutateAsync({ prazoResolucao: prazoResolucaoDraft }));
    }
    if (updates.length === 0) return;
    await Promise.all(updates);
  }

  function assignSelectedResponsavel() {
    if (!selectedResponsavelId || selectedResponsavelId === demandaAtual.responsavelId) return;
    assignMutation.mutate(selectedResponsavelId);
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
              {canAssumir && (
                <Button type="button" variant="outline" disabled={assumeMutation.isPending} onClick={() => assumeMutation.mutate()}>Assumir</Button>
              )}
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
            <h2 className="font-display text-lg font-semibold">Historico</h2>
            <div className="mt-5">
              {timelineEventos.map((evento) => (
                <TimelineEvento key={evento.id} evento={evento} autorNome={autores.get(evento.autorId)} />
              ))}
              {timelineEventos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>}
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
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Prazo solicitado</dt><dd className="font-medium">{formatDate(demanda.prazo)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Prazo resolucao</dt><dd className="font-medium">{formatDate(demanda.prazoResolucao)}</dd></div>
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
            {canShowTriagem && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div>
                  <p className="text-sm font-medium">Triagem</p>
                  <p className="mt-1 text-xs text-muted-foreground">Atribua a demanda a alguem habilitado para receber demandas nesta area.</p>
                </div>
                <Select value={selectedResponsavelId} onValueChange={setSelectedResponsavelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar responsavel" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsaveisDisponiveis.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome}{usuario.id === demandaAtual.responsavelId ? " (atual)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {responsaveisDisponiveis.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum usuario habilitado para receber demandas nesta area.</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={
                    !selectedResponsavelId ||
                    selectedResponsavelId === demandaAtual.responsavelId ||
                    assignMutation.isPending
                  }
                  onClick={assignSelectedResponsavel}
                >
                  <UserRound className="h-4 w-4" />
                  {assignMutation.isPending ? "Atribuindo..." : "Atribuir Demanda"}
                </Button>
              </div>
            )}
          </section>

          {canManageAtendimento && (
            <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-base font-semibold">Controle da Demanda</h2>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select value={statusDraft} onValueChange={(value) => setStatusDraft(value as DemandaStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMANDA_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>{status.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Prazo de resolucao</label>
                  <Input
                    type="date"
                    value={prazoResolucaoDraft}
                    onChange={(event) => setPrazoResolucaoDraft(event.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  disabled={statusMutation.isPending || updateMutation.isPending}
                  onClick={saveDemandControl}
                >
                  {statusMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar Controle"}
                </Button>
              </div>
            </section>
          )}

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

        </aside>
      </div>
    </div>
  );
}
