import { Papel, Prisma, Usuario } from '@prisma/client';

export function buildDemandaAccessWhere(
  usuario: Usuario,
): Prisma.DemandaWhereInput {
  if (usuario.papel === Papel.ADMIN) {
    return {};
  }

  if (usuario.papel === Papel.GESTOR) {
    if (!usuario.areaId) {
      return { id: { in: [] } };
    }

    return { areaId: usuario.areaId };
  }

  return {
    OR: [{ solicitanteId: usuario.id }, { responsavelId: usuario.id }],
  };
}

export function canAccessDemanda(
  usuario: Usuario,
  demanda: {
    solicitanteId: string;
    responsavelId: string | null;
    areaId: string;
  },
): boolean {
  if (usuario.papel === Papel.ADMIN) {
    return true;
  }

  if (usuario.papel === Papel.GESTOR && usuario.areaId === demanda.areaId) {
    return true;
  }

  return (
    demanda.solicitanteId === usuario.id ||
    demanda.responsavelId === usuario.id
  );
}
