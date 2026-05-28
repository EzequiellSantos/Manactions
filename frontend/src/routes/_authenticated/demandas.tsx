import { createFileRoute } from "@tanstack/react-router";
import { DEMANDAS_RECENTES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/intrahub/StatusBadge";

export const Route = createFileRoute("/_authenticated/demandas")({
  head: () => ({ meta: [{ title: "Demandas — IntraHub" }] }),
  component: DemandasPage,
});

function DemandasPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Demandas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Todas as suas solicitações em um só lugar.</p>
      </header>

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
                  <p className="font-medium">{d.titulo}</p>
                  <p className="text-xs text-muted-foreground">#{d.id}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.area}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{d.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
