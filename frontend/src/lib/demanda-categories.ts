import type { Area } from "@/lib/types";

export const OUTROS_DEMANDA_CATEGORY = "Outros";

const CATEGORY_OPTIONS_BY_AREA_KEY: Record<string, string[]> = {
  ti: [
    "Suporte tecnico (hardware/software)",
    "Solicitacao de acesso a sistema",
    "Criacao / desativacao de conta",
    "VPN e acesso remoto",
    "Compra de equipamento",
    "Falha em sistema interno",
    "Manutencao preventiva",
  ],
  rh: [
    "Duvida sobre beneficios",
    "Solicitacao de ferias",
    "Atualizacao de dados cadastrais",
    "Processo seletivo / vaga interna",
    "Treinamento e capacitacao",
    "Desligamento de colaborador",
    "Carta de recomendacao / declaracao",
  ],
  financeiro: [
    "Reembolso de despesa",
    "Solicitacao de nota fiscal",
    "Pagamento a fornecedor",
    "Abertura de centro de custo",
    "Duvida sobre folha de pagamento",
    "Prestacao de contas",
    "Adiantamento",
  ],
  marketing: [
    "Criacao de material grafico",
    "Publicacao em redes sociais",
    "Solicitacao de texto / copywriting",
    "Evento interno",
    "Atualizacao de site",
    "Campanha promocional",
  ],
  juridico: [
    "Analise de contrato",
    "Elaboracao de contrato",
    "Duvida trabalhista",
    "Registro de marca / propriedade intelectual",
    "Compliance e LGPD",
    "Procuracao",
  ],
  operacoes: [
    "Compra de insumos",
    "Manutencao de infraestrutura",
    "Gestao de fornecedor",
    "Logistica interna",
    "Controle de estoque",
    "Facilities (limpeza, seguranca, espaco fisico)",
  ],
};

function normalizeKey(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getDemandaCategoryOptions(area?: Pick<Area, "nome" | "slug" | "categoria"> | null) {
  const source = `${area?.slug ?? ""} ${area?.nome ?? ""} ${area?.categoria ?? ""}`;
  const normalized = normalizeKey(source);

  const areaKey =
    normalized.includes("tecnologia") || normalized.includes("informacao") || normalized.includes("ti")
      ? "ti"
      : normalized.includes("recursos humanos") || normalized.includes("gente") || normalized.includes("rh")
        ? "rh"
        : normalized.includes("financeiro")
          ? "financeiro"
          : normalized.includes("marketing") || normalized.includes("comunicacao")
            ? "marketing"
            : normalized.includes("juridico")
              ? "juridico"
              : normalized.includes("operacoes") || normalized.includes("operacional") || normalized.includes("facilities")
                ? "operacoes"
                : undefined;

  const options = areaKey ? CATEGORY_OPTIONS_BY_AREA_KEY[areaKey] : [];
  return [...options, OUTROS_DEMANDA_CATEGORY];
}
