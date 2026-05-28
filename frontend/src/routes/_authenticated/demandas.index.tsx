import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { DemandaRow } from "@/components/intrahub/DemandaRow";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AREAS,
  DEMANDAS,
  DEMANDA_STATUS_OPTIONS,
  PRIORIDADE_OPTIONS,
  getAreaById,
  type Demanda,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/demandas/")({
  head: () => ({ meta: [{ title: "Minhas Demandas — IntraHub" }] }),
  component: DemandasPage,
});

const PAGE_SIZE = 5;

function toCsv(rows: Demanda[]) {
  const header = ["ID", "Título", "Área", "Prioridade", "Status", "Criada em", "Prazo"];
  const body = rows.map((demanda) => [
    demanda.id,
    demanda.titulo,
    getAreaById(demanda.areaId)?.nome ?? demanda.areaId,
    demanda.prioridade,
    demanda.status,
    demanda.criadaEm.toISOString(),
    demanda.prazo?.toISOString() ?? "",
  ]);
  return [header, ...body]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function DemandasPage() {
  const [tab, setTab] = useState("minhas");
  const [status, setStatus] = useState("todos");
  const [area, setArea] = useState("todas");
  const [prioridade, setPrioridade] = useState("todas");
  const [periodo, setPeriodo] = useState("todos");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return DEMANDAS.filter((demanda) => {
      if (status !== "todos" && demanda.status !== status) return false;
      if (area !== "todas" && demanda.areaId !== area) return false;
      if (prioridade !== "todas" && demanda.prioridade !== prioridade) return false;
      if (periodo === "7d") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (demanda.criadaEm < sevenDaysAgo) return false;
      }
      if (tab === "minhas" && demanda.solicitanteId !== "user-1") return false;
      if (tab === "area" && demanda.areaId !== "ti") return false;
      return true;
    });
  }, [area, periodo, prioridade, status, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "demandas.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Minhas Demandas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe solicitações, prazos e responsáveis.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="gap-2" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button asChild className="gap-2">
            <Link to="/demandas/nova">
              <Plus className="h-4 w-4" />
              Nova Demanda
            </Link>
          </Button>
        </div>
      </header>

      <Tabs value={tab} onValueChange={(value) => { setTab(value); setPage(1); }}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
          <TabsTrigger value="minhas">Minhas Demandas</TabsTrigger>
          <TabsTrigger value="todas">Todas as Demandas</TabsTrigger>
          <TabsTrigger value="area">Para Minha Área</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {DEMANDA_STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={area} onValueChange={(value) => { setArea(value); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as áreas</SelectItem>
            {AREAS.map((item) => <SelectItem key={item.id} value={item.id}>{item.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={prioridade} onValueChange={(value) => { setPrioridade(value); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as prioridades</SelectItem>
            {PRIORIDADE_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={periodo} onValueChange={(value) => { setPeriodo(value); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo período</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#ID</th>
                <th className="px-4 py-3 text-left font-semibold">Título</th>
                <th className="px-4 py-3 text-left font-semibold">Área</th>
                <th className="px-4 py-3 text-left font-semibold">Prioridade</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Responsável</th>
                <th className="px-4 py-3 text-left font-semibold">Criada em</th>
                <th className="px-4 py-3 text-left font-semibold">Prazo</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((demanda) => <DemandaRow key={demanda.id} demanda={demanda} />)}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>{filtered.length} demandas encontradas</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
              Anterior
            </Button>
            <span>Página {page} de {totalPages}</span>
            <Button type="button" variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
