import { useEffect, useRef } from "react";
import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/intrahub/AppSidebar";
import { Topbar } from "@/components/intrahub/Topbar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { loading, user } = useAuth();
  const location = useRouterState({ select: (state) => state.location });
  const pathname = location.pathname;
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (user) {
      redirectingRef.current = false;
      return;
    }

    if (loading || redirectingRef.current) return;

    redirectingRef.current = true;
    const params = new URLSearchParams({ redirect: location.href });
    window.location.replace(`/login?${params.toString()}`);
  }, [loading, user, location.href]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
