import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AreaCard } from "@/components/intrahub/AreaCard";
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
import { AREA_ICON_OPTIONS, getAreaIcon } from "@/lib/area-icons";
import type { Area, CanalTipo } from "@/lib/types";
import { createArea } from "@/lib/backend/areas";

const AREA_CATEGORIAS = ["Tecnologia", "Pessoas", "Administrativo", "Comunicacao", "Governanca", "Operacao", "Geral"];

const canalSchema = z.object({
  tipo: z.enum(["email", "discord", "whatsapp", "teams", "outro"]),
  label: z.string().min(2, "Informe um label."),
  valor: z.string().min(2, "Informe o valor do canal."),
  link: z.string().url("Informe uma URL válida.").optional().or(z.literal("")),
});

const areaSchema = z.object({
  nome: z.string().min(3, "Informe o nome da área."),
  slug: z.string().min(3, "Informe o slug.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens."),
  descricao: z.string().min(12, "Informe uma descrição curta."),
  responsabilidades: z.string().min(12, "Informe ao menos uma responsabilidade."),
  categoria: z.string().min(2, "Selecione ou informe uma categoria."),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Escolha uma cor válida."),
  icone: z.string().min(1, "Selecione um ícone."),
  canaisContato: z.array(canalSchema).min(1, "Adicione ao menos um canal."),
});

type AreaFormValues = z.infer<typeof areaSchema>;

export const Route = createFileRoute("/_authenticated/areas/nova")({
  head: () => ({ meta: [{ title: "Nova Área — IntraHub" }] }),
  component: NovaAreaPage,
});

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NovaAreaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      nome: "",
      slug: "",
      descricao: "",
      responsabilidades: "",
      categoria: AREA_CATEGORIAS[0] ?? "Geral",
      cor: "#2563eb",
      icone: "Monitor",
      canaisContato: [{ tipo: "email", label: "Atendimento", valor: "", link: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "canaisContato",
  });

  const nome = form.watch("nome");
  const values = form.watch();
  const IconPreview = getAreaIcon(values.icone);
  const createMutation = useMutation({
    mutationFn: createArea,
    onSuccess: async (area) => {
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Area criada");
      navigate({ to: "/areas/$slug", params: { slug: area.slug } });
    },
    onError: () => toast.error("Nao foi possivel criar a area"),
  });

  useEffect(() => {
    const currentSlug = form.getValues("slug");
    if (!currentSlug || currentSlug === slugify(nome.slice(0, -1))) {
      form.setValue("slug", slugify(nome), { shouldValidate: true });
    }
  }, [form, nome]);

  const previewArea = useMemo<Area>(() => {
    const responsabilidades = values.responsabilidades
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      id: values.slug || "nova-area",
      nome: values.nome || "Nome da área",
      slug: values.slug || "nova-area",
      descricao: values.descricao || "Descrição curta da área para visualizar o card.",
      descricaoCompleta: values.descricao || "Descrição completa da área.",
      responsabilidades,
      categoria: values.categoria || "Categoria",
      cor: values.cor || "#2563eb",
      icone: values.icone || "Monitor",
      canaisContato: values.canaisContato.map((canal) => ({
        tipo: canal.tipo as CanalTipo,
        label: canal.label,
        valor: canal.valor,
        link: canal.link || undefined,
      })),
      responsaveis: [],
      processos: [],
    };
  }, [values]);

  function onSubmitConnected(data: AreaFormValues) {
    createMutation.mutate({
      nome: data.nome,
      slug: data.slug,
      descricao: data.descricao,
      responsabilidades: data.responsabilidades
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      categoria: data.categoria,
      cor: data.cor,
      icone: data.icone,
      canaisContato: data.canaisContato.map((canal) => ({
        tipo: canal.tipo,
        label: canal.label,
        valor: canal.valor,
        link: canal.link || undefined,
      })),
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Button asChild variant="ghost" className="gap-2 px-0">
        <Link to="/areas">
          <ArrowLeft className="h-4 w-4" />
          Voltar para áreas
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Nova Área</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre a estrutura da area no backend.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitConnected)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Tecnologia da Informação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="tecnologia-da-informacao" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Descreva a área em poucas linhas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsabilidades"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsabilidades</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder={"Uma responsabilidade por linha\nEx.: Gerenciar acessos"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREA_CATEGORIAS.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor temática</FormLabel>
                      <FormControl>
                        <Input type="color" className="h-9 p-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Ícone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREA_ICON_OPTIONS.map((icone) => (
                            <SelectItem key={icone} value={icone}>
                              {icone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-semibold">Canais de contato</h2>
                    <p className="text-sm text-muted-foreground">Adicione e remova canais conforme a área precisar.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => append({ tipo: "email", label: "", valor: "", link: "" })}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[0.8fr_1fr_1fr_1fr_auto]">
                      <FormField
                        control={form.control}
                        name={`canaisContato.${index}.tipo`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="email">E-mail</SelectItem>
                                <SelectItem value="discord">Discord</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="teams">Teams</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`canaisContato.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Atendimento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`canaisContato.${index}.valor`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor</FormLabel>
                            <FormControl>
                              <Input placeholder="contato@empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`canaisContato.${index}.link`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-0 gap-2 md:mt-8"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit">Salvar Área</Button>
            </form>
          </Form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: values.cor }}
              >
                <IconPreview className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
                <h2 className="font-display text-base font-semibold">{values.nome || "Nova Área"}</h2>
              </div>
            </div>
          </div>
          <AreaCard area={previewArea} />
        </aside>
      </div>
    </div>
  );
}
