import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getProfile, type UserProfile } from "@/lib/backend/profile";
import type { Demanda } from "@/lib/types";

export type UserRole = "ADMIN" | "GESTOR" | "COLABORADOR";

type DemandLike = Pick<Demanda, "areaId" | "solicitanteId" | "responsavelId" | "status">;

function isOpenDemand(status?: Demanda["status"]) {
  return status === "aberta";
}

function isSameArea(user: UserProfile | undefined, areaId?: string) {
  return !!user?.areaId && !!areaId && user.areaId === areaId;
}

export function usePermissions() {
  const { loading: authLoading, user: authUser } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["profile", "permissions"],
    queryFn: getProfile,
    enabled: !authLoading && !!authUser,
    staleTime: 30_000,
  });

  const permissions = useMemo(() => {
    const currentUser = profileQuery.data;
    const role = (currentUser?.papel ?? "COLABORADOR") as UserRole;
    const isAdmin = role === "ADMIN";
    const isGestor = role === "GESTOR";
    const isColaborador = role === "COLABORADOR";
    const areaId = currentUser?.areaId;
    const canReceiveDemandas = currentUser?.recebeDemandas === true;

    function canManageArea(targetAreaId?: string) {
      if (!currentUser) return false;
      if (isAdmin) return true;
      return isGestor && isSameArea(currentUser, targetAreaId);
    }

    function canOpenDemanda(targetAreaId?: string) {
      return !!currentUser && !!targetAreaId;
    }

    function canViewDemanda(demanda?: DemandLike | null) {
      if (!currentUser || !demanda) return false;
      if (isAdmin) return true;
      if (isGestor && isSameArea(currentUser, demanda.areaId)) return true;
      return demanda.solicitanteId === currentUser.id || demanda.responsavelId === currentUser.id;
    }

    function canEditDemanda(demanda?: DemandLike | null) {
      if (!currentUser || !demanda || !canViewDemanda(demanda)) return false;
      if (isAdmin) return true;
      if (demanda.solicitanteId === currentUser.id && isOpenDemand(demanda.status)) return true;
      return demanda.responsavelId === currentUser.id;
    }

    function canManageDemanda(demanda?: DemandLike | null) {
      if (!currentUser || !demanda || !canViewDemanda(demanda)) return false;
      if (isAdmin) return true;
      if (isGestor && isSameArea(currentUser, demanda.areaId)) return true;
      return demanda.responsavelId === currentUser.id;
    }

    function canChangeDemandaStatus(demanda?: DemandLike | null) {
      return canManageDemanda(demanda);
    }

    function canAssumeDemanda(demanda?: DemandLike | null) {
      if (!currentUser || !demanda || !canViewDemanda(demanda)) return false;
      if (demanda.responsavelId === currentUser.id) return false;
      if (isAdmin) return true;
      if (demanda.solicitanteId === currentUser.id) return true;
      return canReceiveDemandas;
    }

    function canReassignDemanda(demanda?: DemandLike | null, targetUser?: Pick<UserProfile, "areaId" | "recebeDemandas"> | null) {
      if (!currentUser || !demanda || !canManageDemanda(demanda)) return false;
      if (targetUser && targetUser.recebeDemandas === false) return false;
      if (isAdmin) return true;
      if (!isGestor || !isSameArea(currentUser, demanda.areaId)) return false;
      return targetUser ? targetUser.areaId === currentUser.areaId : true;
    }

    return {
      currentUser,
      role,
      areaId,
      isAdmin,
      isGestor,
      isColaborador,
      canReceiveDemandas,
      canManageArea,
      canOpenDemanda,
      canViewDemanda,
      canEditDemanda,
      canManageDemanda,
      canChangeDemandaStatus,
      canAssumeDemanda,
      canReassignDemanda,
    };
  }, [profileQuery.data]);

  return {
    ...permissions,
    isLoading: authLoading || profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
  };
}
