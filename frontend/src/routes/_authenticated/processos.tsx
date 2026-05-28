import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/intrahub/EmptyState";

export const Route = createFileRoute("/_authenticated/processos")({
  head: () => ({ meta: [{ title: "Processos — IntraHub" }] }),
  component: ProcessosPage,
});

function ProcessosPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Processos</h1>
        <p className="mt-1 text-sm text-muted-foreground">POPs, fluxos e documentação corporativa.</p>
      </header>
      <EmptyState
        icon={ClipboardList}
        title="Nenhum processo publicado ainda"
        description="Quando o backend NestJS estiver conectado, os processos da sua área aparecerão aqui."
      />
    </div>
  );
}
