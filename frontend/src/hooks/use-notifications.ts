import { useQuery } from "@tanstack/react-query";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "demanda" | "aviso" | "processo";
}

// Mock — substituir por chamada ao backend NestJS quando disponível.
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    title: "Nova demanda atribuída",
    description: "Solicitação de contratação aguardando sua análise.",
    time: "há 5 min",
    read: false,
    type: "demanda",
  },
  {
    id: "2",
    title: "Aprovação pendente",
    description: "Demanda #2487 do RH precisa da sua aprovação.",
    time: "há 1 h",
    read: false,
    type: "demanda",
  },
  {
    id: "3",
    title: "Aviso da Diretoria",
    description: "Reunião geral amanhã às 10h no auditório.",
    time: "há 3 h",
    read: false,
    type: "aviso",
  },
  {
    id: "4",
    title: "Processo atualizado",
    description: "POP de Compras teve nova revisão publicada.",
    time: "ontem",
    read: true,
    type: "processo",
  },
];

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<AppNotification[]> => {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_NOTIFICATIONS;
    },
  });
}
