import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/hooks/use-permissions";
import { deleteArea, getAreas, updateArea } from "@/lib/backend/areas";
import {
  deleteUser,
  getUsers,
  updateUserAdmin,
  updateUserRole,
  type BackendUserListItem,
} from "@/lib/backend/users";
import type { Area } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Admin - Configuracoes - Manactions" }] }),
  component: AdminConfiguracoesPage,
});

type Papel = "ADMIN" | "GESTOR" | "COLABORADOR";

interface UserDraft {
  papel: Papel;
  areaId: string;
  recebeDemandas: boolean;
}

interface AreaDraft {
  nome: string;
  slug: string;
  descricao: string;
  responsabilidades: string;
  categoria: string;
  cor: string;
  icone: string;
}

const NO_AREA_VALUE = "sem_area";

function isPapel(value: string): value is Papel {
  return value === "ADMIN" || value === "GESTOR" || value === "COLABORADOR";
}

function responsabilidadesToText(values: string[]) {
  return values.join("\n");
}

function textToResponsabilidades(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function AdminConfiguracoesPage() {
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<BackendUserListItem | null>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [userDraft, setUserDraft] = useState<UserDraft>({
    papel: "COLABORADOR",
    areaId: NO_AREA_VALUE,
    recebeDemandas: false,
  });
  const [areaDraft, setAreaDraft] = useState<AreaDraft>({
    nome: "",
    slug: "",
    descricao: "",
    responsabilidades: "",
    categoria: "",
    cor: "#3B5BDB",
    icone: "Building",
  });

  const queriesEnabled = !permissionsLoading && isAdmin;
  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsers,
    enabled: queriesEnabled,
  });
  const { data: areas = [], isLoading: loadingAreas } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
    enabled: queriesEnabled,
  });

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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["areas"] }),
        queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
      ]);
      toast.success("Area desativada");
    },
    onError: () => toast.error("Nao foi possivel desativar a area"),
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ user, next }: { user: BackendUserListItem; next: UserDraft }) => {
      if (isPapel(user.papel) && user.papel !== next.papel) {
        await updateUserRole(user.id, next.papel);
      }

      return updateUserAdmin(user.id, {
        areaId: next.areaId === NO_AREA_VALUE ? null : next.areaId,
        recebeDemandas: next.recebeDemandas,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
        queryClient.invalidateQueries({ queryKey: ["areas"] }),
        queryClient.invalidateQueries({ queryKey: ["profile", "permissions"] }),
      ]);
      setEditingUser(null);
      toast.success("Usuario atualizado");
    },
    onError: () => toast.error("Nao foi possivel atualizar o usuario"),
  });

  const updateAreaMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: AreaDraft }) =>
      updateArea(id, {
        nome: next.nome.trim(),
        slug: next.slug.trim() || undefined,
        descricao: next.descricao.trim(),
        responsabilidades: textToResponsabilidades(next.responsabilidades),
        categoria: next.categoria.trim(),
        cor: next.cor.trim(),
        icone: next.icone.trim(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["areas"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setEditingArea(null);
      toast.success("Area atualizada");
    },
    onError: () => toast.error("Nao foi possivel atualizar a area"),
  });

  if (permissionsLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-xl items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta area e reservada para administradores do sistema.
        </p>
      </div>
    );
  }

  function openUserEditor(usuario: BackendUserListItem) {
    setEditingUser(usuario);
    setUserDraft({
      papel: isPapel(usuario.papel) ? usuario.papel : "COLABORADOR",
      areaId: usuario.areaId ?? NO_AREA_VALUE,
      recebeDemandas: usuario.recebeDemandas,
    });
  }

  function openAreaEditor(area: Area) {
    setEditingArea(area);
    setAreaDraft({
      nome: area.nome,
      slug: area.slug,
      descricao: area.descricao,
      responsabilidades: responsabilidadesToText(area.responsabilidades),
      categoria: area.categoria,
      cor: area.cor,
      icone: area.icone,
    });
  }

  function saveUser() {
    if (!editingUser) return;
    updateUserMutation.mutate({ user: editingUser, next: userDraft });
  }

  function saveArea() {
    if (!editingArea) return;
    if (!areaDraft.nome.trim() || !areaDraft.descricao.trim() || !areaDraft.categoria.trim()) {
      toast.error("Preencha nome, descricao e categoria.");
      return;
    }
    updateAreaMutation.mutate({ id: editingArea.id, next: areaDraft });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Configuracoes Gerais</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administre usuarios, papeis, areas e flags do sistema.</p>
      </header>

      <Tabs defaultValue="usuarios" className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Usuarios</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 text-left">Nome</th>
                  <th className="py-2 text-left">E-mail</th>
                  <th className="py-2 text-left">Papel</th>
                  <th className="py-2 text-left">Area</th>
                  <th className="py-2 text-left">Recebe demandas</th>
                  <th className="py-2 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingUsuarios && (
                  <tr>
                    <td className="py-4 text-sm text-muted-foreground" colSpan={6}>Carregando usuarios...</td>
                  </tr>
                )}
                {!loadingUsuarios && usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="py-3 font-medium">{usuario.nome}</td>
                    <td className="py-3 text-muted-foreground">{usuario.email}</td>
                    <td className="py-3 text-muted-foreground">{usuario.papel}</td>
                    <td className="py-3 text-muted-foreground">{usuario.area?.nome ?? "Sem area"}</td>
                    <td className="py-3 text-muted-foreground">{usuario.recebeDemandas ? "Sim" : "Nao"}</td>
                    <td className="py-3 text-right">
                      <Button type="button" variant="ghost" size="icon" aria-label="Editar usuario" onClick={() => openUserEditor(usuario)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" aria-label="Excluir usuario" onClick={() => deleteUserMutation.mutate(usuario.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
              <div key={area.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{area.nome}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{area.descricao}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{area.categoria}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" aria-label="Editar area" onClick={() => openAreaEditor(area)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" aria-label="Excluir area" onClick={() => deleteAreaMutation.mutate(area.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>{editingUser?.nome} - {editingUser?.email}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Papel</Label>
              <Select value={userDraft.papel} onValueChange={(value) => setUserDraft((current) => ({ ...current, papel: value as Papel }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="GESTOR">GESTOR</SelectItem>
                  <SelectItem value="COLABORADOR">COLABORADOR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Area</Label>
              <Select value={userDraft.areaId} onValueChange={(value) => setUserDraft((current) => ({ ...current, areaId: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_AREA_VALUE}>Sem area</SelectItem>
                  {areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
              <Checkbox
                checked={userDraft.recebeDemandas}
                onCheckedChange={(checked) => setUserDraft((current) => ({ ...current, recebeDemandas: checked === true }))}
              />
              <span>
                <span className="block font-medium">Recebe demandas</span>
                <span className="block text-muted-foreground">Permite que o usuario seja responsavel e receba atribuicoes/notificacoes da area.</span>
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button type="button" disabled={updateUserMutation.isPending} onClick={saveUser}>
              {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingArea} onOpenChange={(open) => !open && setEditingArea(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar area</DialogTitle>
            <DialogDescription>Atualize os dados principais exibidos na intranet.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="area-nome">Nome</Label>
              <Input id="area-nome" value={areaDraft.nome} onChange={(event) => setAreaDraft((current) => ({ ...current, nome: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area-slug">Slug</Label>
              <Input id="area-slug" value={areaDraft.slug} onChange={(event) => setAreaDraft((current) => ({ ...current, slug: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area-categoria">Categoria</Label>
              <Input id="area-categoria" value={areaDraft.categoria} onChange={(event) => setAreaDraft((current) => ({ ...current, categoria: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area-cor">Cor</Label>
              <Input id="area-cor" type="color" value={areaDraft.cor} onChange={(event) => setAreaDraft((current) => ({ ...current, cor: event.target.value }))} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="area-icone">Icone</Label>
              <Input id="area-icone" value={areaDraft.icone} onChange={(event) => setAreaDraft((current) => ({ ...current, icone: event.target.value }))} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="area-descricao">Descricao</Label>
              <Textarea id="area-descricao" rows={3} value={areaDraft.descricao} onChange={(event) => setAreaDraft((current) => ({ ...current, descricao: event.target.value }))} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="area-responsabilidades">Responsabilidades</Label>
              <Textarea
                id="area-responsabilidades"
                rows={5}
                value={areaDraft.responsabilidades}
                onChange={(event) => setAreaDraft((current) => ({ ...current, responsabilidades: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingArea(null)}>Cancelar</Button>
            <Button type="button" disabled={updateAreaMutation.isPending} onClick={saveArea}>
              {updateAreaMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
