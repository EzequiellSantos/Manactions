import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { deleteArea, getAreas } from "@/lib/backend/areas";
import { getProcessos } from "@/lib/backend/processos";
import { deleteUser, getUsers, updateUserRole } from "@/lib/backend/users";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Admin - Configuracoes - IntraHub" }] }),
  component: AdminConfiguracoesPage,
});

function AdminConfiguracoesPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({ queryKey: ["usuarios"], queryFn: getUsers, enabled: !loading });
  const { data: areas = [], isLoading: loadingAreas } = useQuery({ queryKey: ["areas"], queryFn: getAreas, enabled: !loading });
  const { data: processos = [] } = useQuery({ queryKey: ["processos"], queryFn: getProcessos, enabled: !loading });
  const categorias = Array.from(new Set(processos.map((processo) => processo.categoria).filter(Boolean)));
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario desativado");
    },
    onError: () => toast.error("Nao foi possivel desativar o usuario"),
  });
  const deleteAreaMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Area desativada");
    },
    onError: () => toast.error("Nao foi possivel desativar a area"),
  });
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, papel }: { id: string; papel: "ADMIN" | "GESTOR" | "COLABORADOR" }) => updateUserRole(id, papel),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Papel do usuario atualizado");
    },
    onError: () => toast.error("Nao foi possivel atualizar o papel"),
  });

  if (user?.user_metadata?.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta area e reservada para administradores do sistema.
        </p>
      </div>
    );
  }

  function editUserRole(id: string, currentRole: string) {
    const next = window.prompt("Novo papel: ADMIN, GESTOR ou COLABORADOR", currentRole);
    const papel = next?.trim().toUpperCase();
    if (papel !== "ADMIN" && papel !== "GESTOR" && papel !== "COLABORADOR") return;
    updateRoleMutation.mutate({ id, papel });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Configuracoes Gerais</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administre usuarios, categorias e features do sistema.</p>
      </header>

      <Tabs defaultValue="usuarios" className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-4">
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificacoes</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Usuarios</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr><th className="py-2 text-left">Nome</th><th className="py-2 text-left">E-mail</th><th className="py-2 text-left">Cargo</th><th className="py-2 text-right">Acoes</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingUsuarios && (
                  <tr>
                    <td className="py-4 text-sm text-muted-foreground" colSpan={4}>Carregando usuarios...</td>
                  </tr>
                )}
                {!loadingUsuarios && usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="py-3 font-medium">{usuario.nome}</td>
                    <td className="py-3 text-muted-foreground">{usuario.email}</td>
                    <td className="py-3 text-muted-foreground">{usuario.cargo ?? usuario.papel}</td>
                    <td className="py-3 text-right">
                      <Button type="button" variant="ghost" size="icon" aria-label="Editar usuario" onClick={() => editUserRole(usuario.id, usuario.papel)}><Edit className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" aria-label="Excluir usuario" onClick={() => deleteUserMutation.mutate(usuario.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="areas" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Areas</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {loadingAreas && (
              <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                Carregando areas...
              </div>
            )}
            {!loadingAreas && areas.map((area) => (
              <div key={area.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="font-medium">{area.nome}</span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" aria-label="Excluir area" onClick={() => deleteAreaMutation.mutate(area.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Categorias de demanda</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => <span key={categoria} className="rounded-md border border-border px-3 py-1 text-sm">{categoria}</span>)}
            {categorias.length === 0 && <span className="text-sm text-muted-foreground">Nenhuma categoria retornada pelo backend.</span>}
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Notificacoes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            As preferencias individuais ficam no perfil do usuario e ja sao persistidas pelo backend.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
