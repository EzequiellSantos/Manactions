import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AreaCard } from "@/components/intrahub/AreaCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { getAreas } from "@/lib/backend/areas";

export const Route = createFileRoute("/_authenticated/areas/")({
  head: () => ({ meta: [{ title: "Áreas da Empresa — IntraHub" }] }),
  component: AreasPage,
});

function AreasPage() {
  const { user } = useAuth();
  const [categoria, setCategoria] = useState("todas");
  const isAdmin = user?.user_metadata?.role === "admin";
  const { data: allAreas = [], isLoading, isError } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  });

  const categorias = useMemo(() => Array.from(new Set(allAreas.map((area) => area.categoria))), [allAreas]);

  const areas = useMemo(() => {
    if (categoria === "todas") return allAreas;
    return allAreas.filter((area) => area.categoria === categoria);
  }, [allAreas, categoria]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Áreas da Empresa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Encontre responsáveis, canais, processos e abertura de demandas por área.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Button asChild className="gap-2">
              <Link to="/areas/nova">
                <Plus className="h-4 w-4" />
                Nova Área
              </Link>
            </Button>
          )}
        </div>
      </header>

      {isLoading && <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Carregando áreas...</div>}
      {isError && <div className="rounded-xl border border-destructive/30 bg-card p-8 text-sm text-destructive">Não foi possível carregar as áreas do backend.</div>}
      {!isLoading && !isError && areas.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Nenhuma área encontrada.</div>
      )}
      {!isLoading && !isError && areas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, index) => (
            <AreaCard key={area.id} area={area} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
