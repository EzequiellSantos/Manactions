import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ListChecks, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { getProfile, updateProfile } from "@/lib/backend/profile";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Meu Perfil — IntraHub" }] }),
  component: PerfilPage,
});

export function PerfilPage() {
  const { displayName, initials, user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState(displayName);
  const [cargo, setCargo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [emailNotify, setEmailNotify] = useState(true);
  const [inAppNotify, setInAppNotify] = useState(true);
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !loading,
  });
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
      ]);
      toast.success("Perfil atualizado");
    },
    onError: () => toast.error("Nao foi possivel atualizar o perfil"),
  });

  useEffect(() => {
    if (!profile) return;
    setNome(profile.nome ?? displayName);
    setCargo(profile.cargo ?? "");
    setDepartamento(profile.departamento ?? "");
    setTelefone(profile.telefone ?? "");
    setEmailNotify(profile.notificacoesEmail ?? true);
    setInAppNotify(profile.notificacoesInApp ?? true);
  }, [displayName, profile]);

  function save() {
    updateMutation.mutate({
      nome,
      cargo,
      departamento,
      telefone,
      notificacoesEmail: emailNotify,
      notificacoesInApp: inAppNotify,
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie dados pessoais e preferências de notificação.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-6 text-center shadow-soft">
          <Avatar className="mx-auto h-28 w-28">
            <AvatarFallback className="bg-gradient-brand text-3xl font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Button type="button" variant="outline" className="mt-4 gap-2">
            <Camera className="h-4 w-4" />
            Trocar foto
          </Button>
          <Button asChild variant="ghost" className="mt-6 w-full gap-2">
            <Link to="/demandas">
              <ListChecks className="h-4 w-4" />
              Minhas Demandas
            </Link>
          </Button>
        </aside>

        <main className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Dados do usuário</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={nome} onChange={(event) => setNome(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={profile?.email ?? user?.email ?? ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input value={cargo} onChange={(event) => setCargo(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Input value={departamento} onChange={(event) => setDepartamento(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={telefone} onChange={(event) => setTelefone(event.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Preferências de notificação</h2>
            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">E-mail</span>
                  <span className="text-xs text-muted-foreground">Receber atualizações importantes por e-mail.</span>
                </span>
                <Switch checked={emailNotify} onCheckedChange={setEmailNotify} />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">In-app</span>
                  <span className="text-xs text-muted-foreground">Receber alertas dentro do Manactions.</span>
                </span>
                <Switch checked={inAppNotify} onCheckedChange={setInAppNotify} />
              </label>
            </div>
          </section>

          <Button type="button" className="gap-2" disabled={updateMutation.isPending} onClick={save}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </main>
      </div>
    </div>
  );
}
