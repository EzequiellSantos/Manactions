import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Layers, ListChecks, ClipboardList, Settings, LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/intrahub/Logo";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/areas", label: "Áreas", icon: Layers },
  { to: "/demandas", label: "Demandas", icon: ListChecks },
  { to: "/processos", label: "Processos", icon: ClipboardList },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

const ADMIN_NAV = { to: "/admin/configuracoes", label: "Admin", icon: ShieldCheck } as const;

interface AppSidebarProps {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export function AppSidebar({ variant = "desktop", onNavigate }: AppSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { displayName, initials, user, signOut } = useAuth();
  const { isAdmin } = usePermissions();
  const navItems = isAdmin ? [...NAV, ADMIN_NAV] : NAV;

  const content = (
    <>
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-brand text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => signOut()}
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  if (variant === "mobile") {
    return <div className="flex h-full flex-col bg-sidebar">{content}</div>;
  }

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar md:flex">
      {content}
    </aside>
  );
}
