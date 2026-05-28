import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/areas")({
  component: AreasLayout,
});

function AreasLayout() {
  return <Outlet />;
}
