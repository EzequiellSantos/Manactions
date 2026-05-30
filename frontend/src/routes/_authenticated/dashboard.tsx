import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Layers, ListChecks, ClockAlert, ClipboardList, ArrowUpRight, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreas } from "@/lib/backend/areas";
import { getDashboard } from "@/lib/backend/dashboard";
import { StatusBadge } from "@/components/intrahub/StatusBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — IntraHub" },
      { name: "description", content: "Resumo das suas demandas, áreas e avisos." },
    ],
  }),
  component: DashboardPage,
});

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function withAlpha(hexColor: string, alpha: number) {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return hexColor;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shortId(id: string) {
  return id.slice(-5).toUpperCase();
}

const STAT_CARDS = [
  { key: "totalAreas", label: "Áreas cadastradas", icon: Layers, accent: "text-primary bg-primary/10" },
  { key: "minhasDemandasAbertas", label: "Minhas demandas abertas", icon: ListChecks, accent: "text-secondary bg-secondary/10" },
  { key: "pendentesAprovacao", label: "Demandas em análise", icon: ClockAlert, accent: "text-warning bg-warning/10" },
  { key: "processosRecentes", label: "Processos cadastrados", icon: ClipboardList, accent: "text-success bg-success/10" },
] as const;

const STAT_CARD_LINKS: Record<(typeof STAT_CARDS)[number]["key"], "/areas" | "/demandas" | "/processos"> = {
  totalAreas: "/areas",
  minhasDemandasAbertas: "/demandas",
  pendentesAprovacao: "/demandas",
  processosRecentes: "/processos",
};

function DashboardPage() {
  const { displayName, loading } = useAuth();
  const firstName = displayName.split(" ")[0];
  const { data: areas = [] } = useQuery({ queryKey: ["areas"], queryFn: getAreas, enabled: !loading });
  const { data: dashboard } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard, enabled: !loading });

  const dashboardStats = dashboard?.stats ?? {
    totalAreas: areas.length,
    minhasDemandasAbertas: 0,
    pendentesAprovacao: 0,
    processosRecentes: 0,
  };
  const quickAreas = dashboard?.areasDestaques.length ? dashboard.areasDestaques : areas;
  const demandasRecentes = dashboard?.demandasRecentes ?? [];
  const comunicados = dashboard?.comunicados ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Saudação */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui está um panorama da sua intranet hoje.
        </p>
      </motion.section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((c, i) => {
          const value = dashboardStats[c.key];
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={STAT_CARD_LINKS[c.key]}
                className="group block rounded-xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold tracking-tight">{value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{c.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* Acesso rápido */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Acesso rápido</h2>
            <p className="text-sm text-muted-foreground">Áreas mais utilizadas pelo time</p>
          </div>
          <Link to="/areas" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickAreas.slice(0, 6).map((a, i) => {
            const Icon = getAreaIcon(a.icone);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  to="/areas/$slug"
                  params={{ slug: a.slug }}
                  className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: withAlpha(a.cor, 0.12), color: a.cor }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-foreground">{a.nome}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.descricao}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Grid inferior */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Demandas recentes */}
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between pb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Minhas demandas recentes</h2>
              <p className="text-sm text-muted-foreground">Últimas 5 demandas atualizadas</p>
            </div>
            <Link to="/demandas" className="text-sm font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            <div className="space-y-3 p-3 md:hidden">
              {demandasRecentes.slice(0, 5).map((d) => {
                const areaNome = areas.find((area) => area.id === d.areaId)?.nome ?? d.areaId;
                return (
                  <Link
                    key={d.id}
                    to="/demandas/$id"
                    params={{ id: d.id }}
                    className="block rounded-lg border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium text-foreground">{d.titulo}</p>
                        <p className="mt-1 text-xs text-muted-foreground">#{shortId(d.id)} · {areaNome}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Atualizada em {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d.atualizadaEm)}
                    </p>
                  </Link>
                );
              })}
              {demandasRecentes.length === 0 && (
                <p className="px-1 py-6 text-sm text-muted-foreground">
                  Nenhuma demanda recente encontrada
                </p>
              )}
            </div>
            <table className="hidden w-full text-sm md:table">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Demanda</th>
                  <th className="px-4 py-3 text-left font-semibold">Área</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {demandasRecentes.slice(0, 5).map((d) => {
                  const areaNome = areas.find((area) => area.id === d.areaId)?.nome ?? d.areaId;
                  return (
                  <tr key={d.id} className="transition hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <Link to="/demandas/$id" params={{ id: d.id }} className="font-medium text-foreground hover:text-primary">
                        {d.titulo}
                      </Link>
                      <p className="text-xs text-muted-foreground">#{shortId(d.id)}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{areaNome}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d.atualizadaEm)}
                    </td>
                  </tr>
                  );
                })}
                {demandasRecentes.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={4}>
                      Nenhuma demanda recente encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Avisos */}
        <div>
          <div className="flex items-end justify-between pb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Avisos e comunicados</h2>
              <p className="text-sm text-muted-foreground">Atualizações da empresa</p>
            </div>
          </div>
          <div className="space-y-3">
            {comunicados.map((a) => (
              <article
                key={a.id}
                className={cn(
                  "rounded-xl border border-border bg-card p-4 shadow-soft transition hover:shadow-elevated",
                  a.destaque && "border-primary/30 bg-primary/5",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-foreground">{a.titulo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.resumo}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {a.autor} · {a.data}
                    </p>
                  </div>
                </div>
              </article>
            ))}
            {comunicados.length === 0 && (
              <article className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-soft">
                Nenhum comunicado encontrado.
              </article>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
