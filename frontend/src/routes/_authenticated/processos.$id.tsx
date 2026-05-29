import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProcessoCard } from "@/components/intrahub/ProcessoCard";
import { getAreas } from "@/lib/backend/areas";
import { getProcessoByIdFromApi, getProcessos } from "@/lib/backend/processos";

export const Route = createFileRoute("/_authenticated/processos/$id")({
  head: () => ({ meta: [{ title: "Processo — IntraHub" }] }),
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
  const { data: processo, isLoading, isError } = useQuery({
    queryKey: ["processos", id],
    queryFn: () => getProcessoByIdFromApi(id),
  });
  const { data: processos = [] } = useQuery({
    queryKey: ["processos"],
    queryFn: getProcessos,
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  });

  if (isLoading) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Carregando processo...</div>;
  }

  if (isError || !processo) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-destructive/30 bg-card p-8 text-sm text-destructive">Não foi possível carregar este processo do backend.</div>;
  }

  const area = areas.find((item) => item.id === processo.areaId);
  const relacionados = (processo.relacionados ?? [])
    .map((relatedId) => processos.find((item) => item.id === relatedId))
    .filter(Boolean);

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
        <h1 className="font-display text-3xl font-bold tracking-tight">{processo.titulo}</h1>
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
    </div>
  );
}
