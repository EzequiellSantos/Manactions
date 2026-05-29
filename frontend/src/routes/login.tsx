import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/intrahub/Logo";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Entrar — IntraHub" },
      { name: "description", content: "Acesse sua central de informações e demandas." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: search.redirect ?? "/dashboard", replace: true });
    }
  }, [user, loading, navigate, search.redirect]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    toast.success("Bem-vindo(a) de volta!");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp(email, password, name);
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    toast.success("Conta criada!", {
      description: "Verifique seu e-mail para confirmar o acesso.",
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="absolute inset-0 bg-gradient-auth animate-gradient-shift" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
            <span className="text-gradient-brand">IntraHub</span>
          </h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Sua central de informações e demandas
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-8">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@empresa.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                   {/*  <Link
                      to="/login"
                      search={{ redirect: search.redirect ?? "/dashboard" }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link> */}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-gradient-brand shadow-primary-glow hover:opacity-95">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  {/*
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>*/}
                </div>

                {/*<Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => toast.info("SSO em breve", { description: "Integração com o provedor corporativo está em configuração." })}
                >
                  <KeyRound className="h-4 w-4" /> Entrar com SSO
                </Button>*/}
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Como devemos te chamar" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">E-mail corporativo</Label>
                  <Input id="email-up" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-up">Senha</Label>
                  <Input id="password-up" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-gradient-brand shadow-primary-glow hover:opacity-95">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com as políticas internas da empresa.
        </p>
      </motion.div>
    </div>
  );
}
