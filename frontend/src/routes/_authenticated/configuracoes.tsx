import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — IntraHub" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const { displayName, initials, user, signOut } = useAuth();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie sua conta e preferências.</p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-base font-semibold">Meu perfil</h2>
        <div className="mt-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-brand text-lg font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-base font-semibold">Sessão</h2>
        <p className="mt-1 text-sm text-muted-foreground">Encerre sua sessão neste dispositivo.</p>
        <Button variant="outline" className="mt-4 gap-2" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" /> Sair da conta
        </Button>
      </section>
    </div>
  );
}
