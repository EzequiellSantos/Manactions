import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Search, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileUpload } from "@/components/intrahub/FileUpload";
import { PrioridadeBadge } from "@/components/intrahub/PrioridadeBadge";
import { Stepper } from "@/components/intrahub/Stepper";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Area, PrioridadeDemanda } from "@/lib/mock-data";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreas } from "@/lib/backend/areas";
import { createDemanda } from "@/lib/backend/demandas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/demandas/nova")({
  head: () => ({ meta: [{ title: "Nova Demanda — IntraHub" }] }),
  component: NovaDemandaPage,
});

const demandaSchema = z.object({
  titulo: z.string().min(4, "Informe um título com pelo menos 4 caracteres."),
  categoria: z.string().min(2, "Selecione uma categoria."),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"]),
  descricao: z.string().min(20, "Descreva a demanda com pelo menos 20 caracteres.").max(1200, "Use até 1200 caracteres."),
  prazo: z.string().optional(),
});

const PRIORIDADE_OPTIONS: PrioridadeDemanda[] = ["baixa", "media", "alta", "urgente"];

type DemandaValues = z.infer<typeof demandaSchema>;

function NovaDemandaPage() {
  const [etapa, setEtapa] = useState(1);
  const [areaSelecionada, setAreaSelecionada] = useState<Area | null>(null);
  const [query, setQuery] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const { data: allAreas = [], isLoading: loadingAreas } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  });
  const createMutation = useMutation({
    mutationFn: createDemanda,
    onSuccess: (demanda) => setSuccessId(demanda.id),
  });

  const form = useForm<DemandaValues>({
    resolver: zodResolver(demandaSchema),
    mode: "onChange",
    defaultValues: {
      titulo: "",
      categoria: "",
      prioridade: "media",
      descricao: "",
      prazo: "",
    },
  });

  const values = form.watch();
  const areas = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allAreas.filter((area) => !q || area.nome.toLowerCase().includes(q) || area.descricao.toLowerCase().includes(q));
  }, [allAreas, query]);

  if (successId) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Demanda enviada</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sua demanda foi registrada com o número #{successId}.</p>
        <Button asChild className="mt-6">
          <Link to="/demandas/$id" params={{ id: "2491" }}>Ver Minha Demanda</Link>
        </Button>
      </div>
    );
  }

  async function nextFromDetails() {
    const ok = await form.trigger();
    if (ok) setEtapa(3);
  }

  function submitDemand() {
    if (!confirmado) return;
    if (!areaSelecionada) return;
    createMutation.mutate({
      areaId: areaSelecionada.id,
      titulo: values.titulo,
      categoria: values.categoria,
      prioridade: values.prioridade,
      descricao: values.descricao,
      prazo: values.prazo || undefined,
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Button asChild variant="ghost" className="gap-2 px-0">
        <Link to="/demandas">
          <ArrowLeft className="h-4 w-4" />
          Voltar para demandas
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Abrir Nova Demanda</h1>
        <p className="mt-1 text-sm text-muted-foreground">Informe a área, detalhe a solicitação e confirme o envio.</p>
      </header>

      <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <Stepper etapas={["Identificar Área", "Descrever Demanda", "Confirmar e Enviar"]} etapaAtual={etapa} />
      </div>

      {etapa === 1 && (
        <section className="space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold">Para qual área você precisa abrir esta demanda?</h2>
            <div className="relative mt-3 max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar área" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingAreas && (
              <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
                Carregando áreas...
              </div>
            )}
            {areas.map((area) => {
              const Icon = getAreaIcon(area.icone);
              const selected = areaSelecionada?.id === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setAreaSelecionada(area)}
                  className={cn(
                    "flex items-start gap-4 rounded-xl border bg-card p-5 text-left shadow-soft transition hover:border-primary/40",
                    selected ? "border-primary ring-2 ring-primary/20" : "border-border",
                  )}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: area.cor }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{area.nome}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{area.descricao}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {areaSelecionada && (
            <div className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-soft md:grid-cols-2">
              <div>
                <h3 className="font-display font-semibold">Canais da área</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {areaSelecionada.canaisContato.map((canal) => <li key={`${canal.tipo}-${canal.valor}`}>{canal.label}: {canal.valor}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-display font-semibold">Responsáveis</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {areaSelecionada.responsaveis.map((responsavel) => <li key={responsavel.id}>{responsavel.nome} · {responsavel.cargo}</li>)}
                </ul>
              </div>
            </div>
          )}

          <Button type="button" disabled={!areaSelecionada} onClick={() => setEtapa(2)}>Continuar</Button>
        </section>
      )}

      {etapa === 2 && (
        <Form {...form}>
          <form className="max-w-3xl space-y-5 rounded-xl border border-border bg-card p-6 shadow-soft">
            <FormField control={form.control} name="titulo" render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl><Input placeholder="Resumo objetivo da demanda" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="categoria" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(areaSelecionada?.processos.map((p) => p.categoria) ?? ["Geral"]).map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="prioridade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {PRIORIDADE_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="pt-1"><PrioridadeBadge prioridade={field.value as PrioridadeDemanda} /></div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="descricao" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição detalhada</FormLabel>
                <FormControl><Textarea rows={7} placeholder="Contexto, impacto e resultado esperado" {...field} /></FormControl>
                <div className="text-right text-xs text-muted-foreground">{field.value.length}/1200</div>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="prazo" render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo desejado</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div>
              <p className="mb-2 text-sm font-medium">Anexos</p>
              <FileUpload />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEtapa(1)}>Voltar</Button>
              <Button type="button" onClick={nextFromDetails}>Continuar</Button>
            </div>
          </form>
        </Form>
      )}

      {etapa === 3 && (
        <section className="max-w-3xl space-y-5 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Confirmar e Enviar</h2>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Área</span><strong>{areaSelecionada?.nome}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Título</span><strong>{values.titulo}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Categoria</span><strong>{values.categoria}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Prioridade</span><PrioridadeBadge prioridade={values.prioridade} /></div>
            <p className="rounded-lg bg-surface p-3 text-muted-foreground">{values.descricao}</p>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={confirmado} onChange={(event) => setConfirmado(event.target.checked)} className="mt-1" />
            Confirmo que as informações estão corretas e autorizo o envio da demanda.
          </label>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setEtapa(2)}>Voltar</Button>
            <Button type="button" disabled={!confirmado} className="gap-2" onClick={submitDemand}>
              <Send className="h-4 w-4" />
              {createMutation.isPending ? "Enviando..." : "Enviar Demanda"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
