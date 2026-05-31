import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendResponsavelMessage } from "@/lib/backend/areas";
import { cn } from "@/lib/utils";
import { type Responsavel } from "@/lib/types";

const STATUS_MAP = {
  ativo: { label: "Ativo", cls: "bg-success/10 text-success border-success/20" },
  ferias: { label: "Ferias", cls: "bg-warning/10 text-warning border-warning/20" },
  remoto: { label: "Remoto", cls: "bg-primary/10 text-primary border-primary/20" },
} satisfies Record<Responsavel["status"], { label: string; cls: string }>;

function hashColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 62% 42%)`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface ResponsavelCardProps {
  areaId: string;
  responsavel: Responsavel;
}

export function ResponsavelCard({ areaId, responsavel }: ResponsavelCardProps) {
  const [open, setOpen] = useState(false);
  const status = STATUS_MAP[responsavel.status];
  const sendMutation = useMutation({
    mutationFn: (payload: { assunto: string; mensagem: string }) =>
      sendResponsavelMessage(areaId, responsavel.id, payload),
    onSuccess: () => {
      toast.success("Mensagem enviada", {
        description: `E-mail enviado para ${responsavel.nome}.`,
      });
      setOpen(false);
    },
    onError: () => toast.error("Nao foi possivel enviar a mensagem"),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const assunto = String(form.get("subject") ?? "").trim();
    const mensagem = String(form.get("message") ?? "").trim();
    sendMutation.mutate({ assunto, mensagem });
  }

  return (
    <>
      <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start gap-4">
          {responsavel.avatar ? (
            <img
              src={responsavel.avatar}
              alt={responsavel.nome}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: hashColor(responsavel.nome) }}
            >
              {initials(responsavel.nome)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-semibold">{responsavel.nome}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{responsavel.cargo}</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  status.cls,
                )}
              >
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <a
          href={`mailto:${responsavel.email}`}
          className="mt-4 inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
        >
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{responsavel.email}</span>
        </a>

        <Button type="button" variant="outline" className="mt-5 gap-2" onClick={() => setOpen(true)}>
          <MessageSquare className="h-4 w-4" />
          Enviar Mensagem
        </Button>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensagem para {responsavel.nome}</DialogTitle>
            <DialogDescription>Envie um e-mail pelo IntraHub para o responsavel da area.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`subject-${responsavel.id}`}>Assunto</Label>
              <Input id={`subject-${responsavel.id}`} name="subject" required placeholder="Resumo do contato" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`message-${responsavel.id}`}>Mensagem</Label>
              <Textarea id={`message-${responsavel.id}`} name="message" required rows={5} placeholder="Descreva o que voce precisa" />
            </div>
            <DialogFooter>
              <Button type="submit" className="gap-2" disabled={sendMutation.isPending}>
                {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sendMutation.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
