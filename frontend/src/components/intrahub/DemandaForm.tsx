import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Paperclip, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { type Area } from "@/lib/mock-data";

const demandaSchema = z.object({
  titulo: z.string().min(4, "Informe um título com pelo menos 4 caracteres."),
  descricao: z.string().min(12, "Descreva a demanda com mais detalhes."),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"]),
  prazo: z.string().optional(),
  anexos: z.instanceof(FileList).optional(),
});

type DemandaFormValues = z.infer<typeof demandaSchema>;

interface DemandaFormProps {
  areaId: string;
  areaNome?: string;
}

export function DemandaForm({ areaId, areaNome }: DemandaFormProps) {
  const form = useForm<DemandaFormValues>({
    resolver: zodResolver(demandaSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      prioridade: "media",
      prazo: "",
    },
  });

  function onSubmit(values: DemandaFormValues) {
    toast.success("Demanda pronta para envio", {
      description: `${values.titulo} será persistida quando o backend estiver conectado.`,
    });
    form.reset({ titulo: "", descricao: "", prioridade: "media", prazo: "" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Área selecionada</p>
          <p className="mt-1 font-display text-base font-semibold">{areaNome ?? areaId}</p>
        </div>

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex.: Solicitação de acesso ao sistema" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="Explique o contexto, impacto e resultado esperado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="prioridade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prazo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo desejado</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="anexos"
          render={({ field: { onChange, value: _value, ...field } }) => (
            <FormItem>
              <FormLabel>Anexos</FormLabel>
              <FormControl>
                <div className="relative">
                  <Paperclip className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="file"
                    multiple
                    className="pl-9"
                    onChange={(event) => onChange(event.target.files ?? undefined)}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="gap-2">
          <Send className="h-4 w-4" />
          Enviar Demanda
        </Button>
      </form>
    </Form>
  );
}
