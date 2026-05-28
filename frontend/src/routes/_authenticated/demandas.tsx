import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/demandas")({
  component: DemandasLayout,
});

function DemandasLayout() {
  return <Outlet />;
}
