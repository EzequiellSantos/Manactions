import { ExternalLink, Hash, Mail, MessageCircle, Phone, Users } from "lucide-react";
import { type CanalContato as CanalContatoType } from "@/lib/mock-data";

const CANAL_ICON = {
  email: Mail,
  discord: Hash,
  whatsapp: Phone,
  teams: Users,
  outro: MessageCircle,
} satisfies Record<CanalContatoType["tipo"], typeof Mail>;

interface CanalContatoProps {
  canal: CanalContatoType;
}

export function CanalContato({ canal }: CanalContatoProps) {
  const Icon = CANAL_ICON[canal.tipo];
  const content = (
    <div className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/30 hover:shadow-elevated">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-foreground">{canal.label}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{canal.valor}</p>
      </div>
      {canal.link && <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </div>
  );

  if (!canal.link) return content;

  return (
    <a href={canal.link} target="_blank" rel="noreferrer" className="block h-full">
      {content}
    </a>
  );
}
