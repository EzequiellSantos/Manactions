import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Layers, ListChecks, ClockAlert, ClipboardList, ArrowUpRight, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AREAS, AVISOS, DASHBOARD_STATS, DEMANDAS_RECENTES, getAreaIcon } from "@/lib/mock-data";
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

const STAT_CARDS = [
  { key: "totalAreas", label: "Áreas cadastradas", icon: Layers, accent: "text-primary bg-primary/10" },
  { key: "minhasDemandasAbertas", label: "Minhas demandas abertas", icon: ListChecks, accent: "text-secondary bg-secondary/10" },
  { key: "pendentesAprovacao", label: "Pendentes de aprovação", icon: ClockAlert, accent: "text-warning bg-warning/10" },
  { key: "processosRecentes", label: "Processos acessados", icon: ClipboardList, accent: "text-success bg-success/10" },
] as const;

function DashboardPage() {
  const { displayName } = useAuth();
  const firstName = displayName.split(" ")[0];

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
          const value = DASHBOARD_STATS[c.key];
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-xl border border-border bg-card p-5 shadow-soft transition hover:shadow-elevated"
            >
              <div className="flex items-start justify-between">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-4 font-display text-3xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{c.label}</p>
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
          {AREAS.slice(0, 6).map((a, i) => {
            const Icon = getAreaIcon(a.icone);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  to="/areas"
                  className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${a.cor.replace(")", " / 0.12)")}`, color: a.cor }}
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
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Demanda</th>
                  <th className="px-4 py-3 text-left font-semibold">Área</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DEMANDAS_RECENTES.map((d) => (
                  <tr key={d.id} className="transition hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{d.titulo}</p>
                      <p className="text-xs text-muted-foreground">#{d.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.area}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{d.data}</td>
                  </tr>
                ))}
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
            {AVISOS.map((a) => (
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
          </div>
        </div>
      </section>
    </div>
  );
}
