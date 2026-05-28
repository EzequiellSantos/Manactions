import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/processos")({
  component: ProcessosLayout,
});

function ProcessosLayout() {
  return <Outlet />;
}
