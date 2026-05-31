import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { CanalContato } from "@/components/intrahub/CanalContato";
import { DemandaForm } from "@/components/intrahub/DemandaForm";
import { ResponsavelCard } from "@/components/intrahub/ResponsavelCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreaBySlugFromApi } from "@/lib/backend/areas";

export const Route = createFileRoute("/_authenticated/areas/$slug")({
  head: () => ({ meta: [{ title: "Área — Manactions" }] }),
  component: AreaDetailPage,
});

function AreaDetailPage() {
  const { slug } = Route.useParams();
  const { loading } = useAuth();
  const { data: area, isLoading, isError } = useQuery({
    queryKey: ["areas", slug],
    queryFn: () => getAreaBySlugFromApi(slug),
    enabled: !loading,
  });

  if (isLoading) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Carregando área...</div>;
  }

  if (isError || !area) {
    return <div className="mx-auto w-full max-w-7xl rounded-xl border border-destructive/30 bg-card p-8 text-sm text-destructive">Não foi possível carregar esta área do backend.</div>;
  }

  const Icon = getAreaIcon(area.icone);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Button asChild variant="ghost" className="gap-2 px-0">
        <Link to="/areas">
          <ArrowLeft className="h-4 w-4" />
          Voltar para áreas
        </Link>
      </Button>

      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="flex h-auto w-full justify-start gap-2 overflow-x-auto rounded-xl p-1.5 md:inline-flex md:w-auto">
          <TabsTrigger value="visao-geral" className="min-w-max px-4 py-2">Visão Geral</TabsTrigger>
          <TabsTrigger value="responsaveis" className="min-w-max px-4 py-2">Responsáveis</TabsTrigger>
          <TabsTrigger value="processos" className="min-w-max px-4 py-2">Processos</TabsTrigger>
          <TabsTrigger value="demanda" className="min-w-max px-4 py-2">Abrir Demanda</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-soft"
          >
            <div className="p-6 text-white sm:p-8" style={{ backgroundColor: area.cor }}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15">
                  <Icon className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-white/75">
                    {area.categoria}
                  </p>
                  <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{area.nome}</h1>
                  <p className="mt-2 max-w-3xl text-sm text-white/85">{area.descricao}</p>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-semibold">Sobre a Área</h2>
              <div className="prose prose-sm mt-3 max-w-none text-muted-foreground">
                <p>{area.descricaoCompleta}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-semibold">Missão e Responsabilidades</h2>
              <ul className="mt-4 space-y-3">
                {area.responsabilidades.map((responsabilidade) => (
                  <li key={responsabilidade} className="flex gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{responsabilidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Canais de Atendimento</h2>
              <p className="text-sm text-muted-foreground">Acesse o canal mais adequado para sua necessidade.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {area.canaisContato.map((canal) => (
                <CanalContato key={`${canal.tipo}-${canal.valor}`} canal={canal} />
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="responsaveis">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {area.responsaveis.map((responsavel) => (
              <ResponsavelCard key={responsavel.id} areaId={area.id} responsavel={responsavel} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processos">
          <div className="space-y-3">
            {area.processos.map((processo) => (
              <article
                key={processo.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {processo.categoria}
                  </p>
                  <h3 className="mt-1 font-display text-base font-semibold">{processo.titulo}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{processo.descricao}</p>
                </div>
                <Button asChild variant="outline" className="gap-2 sm:shrink-0">
                  <Link to="/processos/$id" params={{ id: processo.id }}>
                    Ver Processo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demanda">
          <div className="max-w-3xl rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Abrir Demanda</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A área já está pré-selecionada para agilizar o atendimento.
            </p>
            <div className="mt-6">
              <DemandaForm areaId={area.id} areaNome={area.nome} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
