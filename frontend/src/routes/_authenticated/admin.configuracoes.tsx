import { createFileRoute } from "@tanstack/react-router";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AREAS, MOCK_USUARIOS, PROCESSO_CATEGORIAS } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Admin — Configurações — IntraHub" }] }),
  component: AdminConfiguracoesPage,
});

function AdminConfiguracoesPage() {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  if (user?.user_metadata?.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta área é reservada para administradores do sistema.
        </p>
      </div>
    );
  }

  function action(label: string) {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast.success(label, { description: "Operação simulada até o backend estar conectado." });
    }, 500);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Configurações Gerais</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administre usuários, categorias e features do sistema.</p>
      </header>

      <Tabs defaultValue="usuarios" className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-4">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Usuários</h2>
            <Button type="button" className="gap-2" onClick={() => action("Usuário criado")}>
              <Plus className="h-4 w-4" />
              Novo usuário
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr><th className="py-2 text-left">Nome</th><th className="py-2 text-left">E-mail</th><th className="py-2 text-left">Cargo</th><th className="py-2 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_USUARIOS.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="py-3 font-medium">{usuario.nome}</td>
                    <td className="py-3 text-muted-foreground">{usuario.email}</td>
                    <td className="py-3 text-muted-foreground">{usuario.cargo}</td>
                    <td className="py-3 text-right">
                      <Button type="button" variant="ghost" size="icon" aria-label="Editar usuário" onClick={() => action("Usuário atualizado")}><Edit className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" aria-label="Excluir usuário" onClick={() => action("Usuário excluído")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="areas" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Áreas</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {AREAS.map((area) => (
              <div key={area.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="font-medium">{area.nome}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => action("Área atualizada")}>Editar</Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Categorias de demanda</h2>
            <Button type="button" className="gap-2" onClick={() => action("Categoria criada")}><Plus className="h-4 w-4" /> Nova categoria</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROCESSO_CATEGORIAS.map((categoria) => <span key={categoria} className="rounded-md border border-border px-3 py-1 text-sm">{categoria}</span>)}
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Features do sistema</h2>
          <div className="mt-5 space-y-4">
            {["Notificações realtime", "Aprovação de demandas", "Base de conhecimento pública"].map((feature) => (
              <label key={feature} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm font-medium">{feature}</span>
                <Switch defaultChecked />
              </label>
            ))}
          </div>
          <Button type="button" className="mt-5 gap-2" disabled={saving} onClick={() => action("Configurações salvas")}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
