import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/intrahub/EmptyState";

export const Route = createFileRoute("/_authenticated/busca")({
  head: () => ({ meta: [{ title: "Busca — Manactions" }] }),
  component: BuscaPage,
});

function BuscaPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Busca avançada</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd> em qualquer página para uma busca rápida.
        </p>
      </header>
      <EmptyState
        icon={Search}
        title="Busca avançada em construção"
        description="Em breve você poderá filtrar por área, status, autor e período."
      />
    </div>
  );
}
