import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import {
  getAreaById,
  getResponsavelById,
  getUsuarioById,
} from "@/lib/mock-data";
import { getAreas } from "@/lib/backend/areas";
import { addDemandaComment, getDemandaById } from "@/lib/backend/demandas";

export const Route = createFileRoute("/_authenticated/demandas/$id")({
  head: () => ({ meta: [{ title: "Demanda — IntraHub" }] }),
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

function DemandaDetailPage() {
  const { id } = Route.useParams();
  const [comentario, setComentario] = useState("");
  const { data: demanda, isLoading, isError } = useQuery({
    queryKey: ["demandas", id],
    queryFn: () => getDemandaById(id),
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  });

  if (isLoading) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Carregando demanda...</div>;
  }

  if (isError || !demanda) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-destructive/30 bg-card p-8 text-sm text-destructive">Não foi possível carregar esta demanda do backend.</div>;
  }

  const demandaAtual = demanda;
  const area = areas.find((item) => item.id === demandaAtual.areaId) ?? getAreaById(demandaAtual.areaId);
  const responsavel = getResponsavelById(demandaAtual.responsavelId);
  const solicitante = getUsuarioById(demandaAtual.solicitanteId);
  const isSolicitante = demandaAtual.solicitanteId === "user-1";
  const isResponsavel = demandaAtual.responsavelId === "ti-2" || area?.id === "ti";

  function action(label: string) {
    toast.info(label, { description: "A ação será conectada ao backend na próxima etapa." });
  }

  async function sendComment() {
    if (!comentario.trim()) return;
    await addDemandaComment(demandaAtual.id, comentario);
    setComentario("");
    toast.success("Comentário pronto para envio", { description: "O backend persistirá essa mensagem depois." });
  }

  function DestructiveAction({ label }: { label: string }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive">{label}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação altera o andamento da demanda. Você poderá auditar o evento no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={() => action(label)}>{label}</AlertDialogAction>
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
          <p className="mt-1 text-sm text-muted-foreground">{area?.nome} · {demanda.categoria}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSolicitante && demanda.status === "aberta" && (
            <>
              <Button type="button" variant="outline" onClick={() => action("Editar demanda")}>Editar</Button>
              <DestructiveAction label="Cancelar" />
            </>
          )}
          {isResponsavel && (
            <>
              <Button type="button" variant="outline" onClick={() => action("Assumir demanda")}>Assumir</Button>
              <Button type="button" variant="outline" onClick={() => action("Alterar status")}>Alterar Status</Button>
              <Button type="button" variant="outline" onClick={() => action("Adicionar prazo")}>Adicionar Prazo</Button>
              <Button type="button" onClick={() => action("Resolver demanda")}>Resolver</Button>
              <DestructiveAction label="Rejeitar" />
            </>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <main className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Descrição</h2>
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
                    <p className="text-xs text-muted-foreground">{anexo.tipo} · {anexo.tamanho}</p>
                  </div>
                </div>
              ))}
              {(demanda.anexos ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nenhum anexo enviado.</p>}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Histórico</h2>
            <div className="mt-5">
              {demanda.historico.map((evento) => <TimelineEvento key={evento.id} evento={evento} />)}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Adicionar Comentário</h2>
            <Textarea className="mt-4" rows={5} value={comentario} onChange={(event) => setComentario(event.target.value)} placeholder="Escreva uma atualização ou dúvida..." />
            <Button type="button" className="mt-3 gap-2" onClick={sendComment}>
              <Send className="h-4 w-4" />
              Enviar comentário
            </Button>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Informações da Demanda</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Área</dt><dd className="font-medium">{area?.nome}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Categoria</dt><dd className="font-medium">{demanda.categoria}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Criado por</dt><dd className="font-medium">{solicitante?.nome}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Criação</dt><dd className="font-medium">{formatDate(demanda.criadaEm, true)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Prazo</dt><dd className="font-medium">{formatDate(demanda.prazo)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Atualização</dt><dd className="font-medium">{formatDate(demanda.atualizadaEm, true)}</dd></div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Responsável Atual</h2>
            <div className="mt-4 flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {initials(responsavel?.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium">{responsavel?.nome ?? "Sem responsável"}</p>
                <p className="text-xs text-muted-foreground">{responsavel?.cargo ?? "Aguardando triagem"}</p>
              </div>
            </div>
            <Button type="button" variant="outline" className="mt-4 w-full gap-2" onClick={() => action("Reatribuir responsável")}>
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
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <CalendarClock className="h-4 w-4" />
              SLA
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">Prazos e regras de atendimento serão calculados pelo backend.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
