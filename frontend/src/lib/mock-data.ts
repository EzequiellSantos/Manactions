import {
  Briefcase,
  DollarSign,
  Headphones,
  Megaphone,
  Monitor,
  Scale,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DemandaStatus = "aberto" | "em_andamento" | "concluido" | "cancelado";
export type ResponsavelStatus = "ativo" | "ferias" | "remoto";
export type CanalTipo = "email" | "discord" | "whatsapp" | "teams" | "outro";
export type PrioridadeDemanda = "baixa" | "media" | "alta" | "urgente";

export interface CanalContato {
  tipo: CanalTipo;
  label: string;
  valor: string;
  link?: string;
}

export interface Responsavel {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  avatar?: string;
  status: ResponsavelStatus;
  areaId: string;
}

export interface ProcessoArea {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  areaId: string;
}

export interface Area {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  descricaoCompleta: string;
  responsabilidades: string[];
  categoria: string;
  cor: string;
  icone: string;
  canaisContato: CanalContato[];
  responsaveis: Responsavel[];
  processos: ProcessoArea[];
}

export interface Demanda {
  id: string;
  titulo: string;
  area: string;
  status: DemandaStatus;
  data: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  resumo: string;
  autor: string;
  data: string;
  destaque?: boolean;
}

export const AREA_ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  DollarSign,
  Headphones,
  Megaphone,
  Monitor,
  Scale,
  Settings,
  ShieldCheck,
  Users,
};

export const AREA_ICON_OPTIONS = Object.keys(AREA_ICON_MAP);

export function getAreaIcon(iconName: string): LucideIcon {
  return AREA_ICON_MAP[iconName] ?? Briefcase;
}

export const AREAS: Area[] = [
  {
    id: "ti",
    nome: "Tecnologia da Informação",
    slug: "tecnologia-da-informacao",
    descricao: "Suporte técnico, sistemas internos, infraestrutura, acessos e segurança digital.",
    descricaoCompleta:
      "A área de Tecnologia da Informação sustenta os sistemas, acessos, dispositivos e integrações que mantêm a operação conectada. Atua no atendimento a incidentes, melhoria contínua de ferramentas e governança técnica para novos projetos digitais.",
    responsabilidades: [
      "Gerenciar acessos a sistemas corporativos.",
      "Atender incidentes de infraestrutura e suporte.",
      "Apoiar integrações com sistemas internos e externos.",
      "Monitorar boas práticas de segurança da informação.",
    ],
    categoria: "Tecnologia",
    cor: "#2563eb",
    icone: "Monitor",
    canaisContato: [
      { tipo: "email", label: "Service Desk", valor: "suporte.ti@intrahub.com", link: "mailto:suporte.ti@intrahub.com" },
      { tipo: "teams", label: "Plantão TI", valor: "Equipe Plantão TI", link: "https://teams.microsoft.com" },
      { tipo: "discord", label: "Canal #suporte-ti", valor: "#suporte-ti", link: "https://discord.com" },
    ],
    responsaveis: [
      { id: "ti-1", nome: "Marina Costa", cargo: "Coordenadora de TI", email: "marina.costa@intrahub.com", status: "ativo", areaId: "ti" },
      { id: "ti-2", nome: "Rafael Nunes", cargo: "Analista de Sistemas", email: "rafael.nunes@intrahub.com", status: "remoto", areaId: "ti" },
      { id: "ti-3", nome: "Bianca Rocha", cargo: "Especialista em Segurança", email: "bianca.rocha@intrahub.com", status: "ativo", areaId: "ti" },
    ],
    processos: [
      { id: "p-ti-1", titulo: "Solicitação de acesso", descricao: "Fluxo para criar, revisar ou remover permissões.", categoria: "Acessos", areaId: "ti" },
      { id: "p-ti-2", titulo: "Troca de equipamento", descricao: "Pedido de notebook, periféricos ou manutenção.", categoria: "Infraestrutura", areaId: "ti" },
      { id: "p-ti-3", titulo: "Incidente crítico", descricao: "Escalonamento para indisponibilidade de sistemas.", categoria: "Suporte", areaId: "ti" },
    ],
  },
  {
    id: "rh",
    nome: "Recursos Humanos / Gente e Gestão",
    slug: "recursos-humanos",
    descricao: "Pessoas, benefícios, admissões, desenvolvimento, clima e políticas internas.",
    descricaoCompleta:
      "Gente e Gestão cuida da jornada das pessoas dentro da empresa, desde admissão e benefícios até desenvolvimento, cultura e suporte a lideranças. A área também mantém políticas internas e canais de acolhimento.",
    responsabilidades: [
      "Conduzir admissões, desligamentos e movimentações internas.",
      "Administrar benefícios e documentos de colaboradores.",
      "Apoiar planos de desenvolvimento e avaliações.",
      "Orientar lideranças sobre políticas de pessoas.",
    ],
    categoria: "Pessoas",
    cor: "#16a34a",
    icone: "Users",
    canaisContato: [
      { tipo: "email", label: "Atendimento RH", valor: "rh@intrahub.com", link: "mailto:rh@intrahub.com" },
      { tipo: "whatsapp", label: "Benefícios", valor: "+55 11 90000-1001", link: "https://wa.me/5511900001001" },
    ],
    responsaveis: [
      { id: "rh-1", nome: "Camila Torres", cargo: "Business Partner", email: "camila.torres@intrahub.com", status: "ativo", areaId: "rh" },
      { id: "rh-2", nome: "Lucas Almeida", cargo: "Analista de Benefícios", email: "lucas.almeida@intrahub.com", status: "ferias", areaId: "rh" },
    ],
    processos: [
      { id: "p-rh-1", titulo: "Solicitação de férias", descricao: "Envio e aprovação de períodos de descanso.", categoria: "Benefícios", areaId: "rh" },
      { id: "p-rh-2", titulo: "Admissão de colaborador", descricao: "Checklist de documentação e onboarding.", categoria: "Contratação", areaId: "rh" },
    ],
  },
  {
    id: "fin",
    nome: "Financeiro",
    slug: "financeiro",
    descricao: "Reembolsos, contas a pagar, pagamentos, notas fiscais e orçamento.",
    descricaoCompleta:
      "O Financeiro organiza pagamentos, reembolsos, conciliações e acompanhamento orçamentário. A área garante previsibilidade nas rotinas financeiras e apoio às decisões de investimento.",
    responsabilidades: [
      "Processar pagamentos e reembolsos.",
      "Conferir notas fiscais e documentos fiscais.",
      "Apoiar análise orçamentária por centro de custo.",
      "Manter prazos financeiros e aprovações registradas.",
    ],
    categoria: "Administrativo",
    cor: "#ca8a04",
    icone: "DollarSign",
    canaisContato: [
      { tipo: "email", label: "Contas a pagar", valor: "financeiro@intrahub.com", link: "mailto:financeiro@intrahub.com" },
      { tipo: "teams", label: "Financeiro Operacional", valor: "Equipe Financeiro", link: "https://teams.microsoft.com" },
    ],
    responsaveis: [
      { id: "fin-1", nome: "Priscila Gomes", cargo: "Gerente Financeira", email: "priscila.gomes@intrahub.com", status: "ativo", areaId: "fin" },
      { id: "fin-2", nome: "André Martins", cargo: "Analista Financeiro", email: "andre.martins@intrahub.com", status: "remoto", areaId: "fin" },
    ],
    processos: [
      { id: "p-fin-1", titulo: "Reembolso de despesas", descricao: "Prestação de contas com anexos fiscais.", categoria: "Reembolso", areaId: "fin" },
      { id: "p-fin-2", titulo: "Cadastro de fornecedor", descricao: "Validação cadastral para novos pagamentos.", categoria: "Fornecedores", areaId: "fin" },
    ],
  },
  {
    id: "mkt",
    nome: "Marketing e Comunicação",
    slug: "marketing-e-comunicacao",
    descricao: "Campanhas, comunicação interna, marca, eventos e materiais institucionais.",
    descricaoCompleta:
      "Marketing e Comunicação fortalece a marca, coordena campanhas internas e externas, apoia eventos e garante consistência nos materiais institucionais usados pelas equipes.",
    responsabilidades: [
      "Planejar campanhas e comunicados internos.",
      "Aprovar peças com identidade visual da marca.",
      "Apoiar eventos corporativos e ações de engajamento.",
      "Gerenciar solicitações de materiais institucionais.",
    ],
    categoria: "Comunicação",
    cor: "#7c3aed",
    icone: "Megaphone",
    canaisContato: [
      { tipo: "email", label: "Briefings", valor: "marketing@intrahub.com", link: "mailto:marketing@intrahub.com" },
      { tipo: "discord", label: "Canal #comunicacao", valor: "#comunicacao", link: "https://discord.com" },
      { tipo: "teams", label: "Central de campanhas", valor: "Equipe Marketing", link: "https://teams.microsoft.com" },
    ],
    responsaveis: [
      { id: "mkt-1", nome: "Nathalia Reis", cargo: "Líder de Comunicação", email: "nathalia.reis@intrahub.com", status: "ativo", areaId: "mkt" },
      { id: "mkt-2", nome: "Felipe Barros", cargo: "Designer de Marca", email: "felipe.barros@intrahub.com", status: "ativo", areaId: "mkt" },
    ],
    processos: [
      { id: "p-mkt-1", titulo: "Solicitação de peça", descricao: "Criação de artes para campanhas e comunicados.", categoria: "Design", areaId: "mkt" },
      { id: "p-mkt-2", titulo: "Comunicado interno", descricao: "Publicação de notícias e avisos corporativos.", categoria: "Comunicação", areaId: "mkt" },
    ],
  },
  {
    id: "jur",
    nome: "Jurídico",
    slug: "juridico",
    descricao: "Contratos, pareceres, riscos regulatórios, compliance e suporte legal.",
    descricaoCompleta:
      "O Jurídico apoia áreas internas em contratos, pareceres, gestão de riscos e conformidade. Atua de forma preventiva para proteger a empresa e acelerar decisões com segurança.",
    responsabilidades: [
      "Revisar contratos e documentos legais.",
      "Apoiar consultas sobre riscos regulatórios.",
      "Orientar áreas sobre compliance e privacidade.",
      "Manter modelos jurídicos atualizados.",
    ],
    categoria: "Governança",
    cor: "#374151",
    icone: "Scale",
    canaisContato: [
      { tipo: "email", label: "Consultas jurídicas", valor: "juridico@intrahub.com", link: "mailto:juridico@intrahub.com" },
      { tipo: "teams", label: "Jurídico Interno", valor: "Equipe Jurídico", link: "https://teams.microsoft.com" },
    ],
    responsaveis: [
      { id: "jur-1", nome: "Helena Duarte", cargo: "Coordenadora Jurídica", email: "helena.duarte@intrahub.com", status: "ativo", areaId: "jur" },
      { id: "jur-2", nome: "Diego Freitas", cargo: "Analista de Contratos", email: "diego.freitas@intrahub.com", status: "remoto", areaId: "jur" },
    ],
    processos: [
      { id: "p-jur-1", titulo: "Revisão contratual", descricao: "Análise de contratos e aditivos.", categoria: "Contratos", areaId: "jur" },
      { id: "p-jur-2", titulo: "Parecer jurídico", descricao: "Solicitação de orientação formal.", categoria: "Consultivo", areaId: "jur" },
    ],
  },
  {
    id: "ops",
    nome: "Operações",
    slug: "operacoes",
    descricao: "Rotinas operacionais, melhoria contínua, atendimento, indicadores e processos.",
    descricaoCompleta:
      "Operações conecta rotinas, processos e indicadores para manter a execução previsível. A área acompanha melhorias, gargalos e padrões operacionais entre os times.",
    responsabilidades: [
      "Mapear e melhorar processos operacionais.",
      "Acompanhar indicadores de atendimento e execução.",
      "Conduzir alinhamentos entre áreas envolvidas.",
      "Documentar padrões e procedimentos recorrentes.",
    ],
    categoria: "Operação",
    cor: "#ea580c",
    icone: "Settings",
    canaisContato: [
      { tipo: "email", label: "Operações", valor: "operacoes@intrahub.com", link: "mailto:operacoes@intrahub.com" },
      { tipo: "whatsapp", label: "Plantão operacional", valor: "+55 11 90000-2002", link: "https://wa.me/5511900002002" },
      { tipo: "teams", label: "Sala de Operações", valor: "Equipe Operações", link: "https://teams.microsoft.com" },
    ],
    responsaveis: [
      { id: "ops-1", nome: "Roberto Lima", cargo: "Gerente de Operações", email: "roberto.lima@intrahub.com", status: "ativo", areaId: "ops" },
      { id: "ops-2", nome: "Patrícia Moura", cargo: "Especialista em Processos", email: "patricia.moura@intrahub.com", status: "ativo", areaId: "ops" },
      { id: "ops-3", nome: "Thiago Azevedo", cargo: "Analista Operacional", email: "thiago.azevedo@intrahub.com", status: "remoto", areaId: "ops" },
    ],
    processos: [
      { id: "p-ops-1", titulo: "Mapeamento de processo", descricao: "Registro de fluxo operacional e responsáveis.", categoria: "Melhoria contínua", areaId: "ops" },
      { id: "p-ops-2", titulo: "Plano de ação operacional", descricao: "Acompanhamento de correções e prazos.", categoria: "Indicadores", areaId: "ops" },
    ],
  },
];

export const AREA_CATEGORIAS = Array.from(new Set(AREAS.map((area) => area.categoria)));

export const DEMANDAS_RECENTES: Demanda[] = [
  { id: "2491", titulo: "Solicitação de acesso ao ERP", area: "Tecnologia da Informação", status: "em_andamento", data: "Hoje, 09:14" },
  { id: "2487", titulo: "Reembolso viagem São Paulo", area: "Financeiro", status: "aberto", data: "Ontem, 17:32" },
  { id: "2480", titulo: "Contratação Analista Pleno", area: "Recursos Humanos / Gente e Gestão", status: "aberto", data: "12/05" },
  { id: "2475", titulo: "Revisão POP de Compras", area: "Jurídico", status: "concluido", data: "10/05" },
  { id: "2470", titulo: "Campanha Dia das Mães", area: "Marketing e Comunicação", status: "cancelado", data: "08/05" },
];

export const AVISOS: Aviso[] = [
  {
    id: "a1",
    titulo: "Reunião geral trimestral",
    resumo: "Quinta-feira, 10h, no auditório principal. Pauta enviada por e-mail.",
    autor: "Diretoria",
    data: "há 2 h",
    destaque: true,
  },
  {
    id: "a2",
    titulo: "Nova política de home office",
    resumo: "Atualização aprovada entra em vigor no dia 1º. Confira o documento completo na área de Gente e Gestão.",
    autor: "RH",
    data: "ontem",
  },
  {
    id: "a3",
    titulo: "Manutenção programada do VPN",
    resumo: "Sábado, das 22h às 02h. Conexões serão derrubadas temporariamente.",
    autor: "TI",
    data: "há 2 dias",
  },
];

export const DASHBOARD_STATS = {
  totalAreas: AREAS.length,
  minhasDemandasAbertas: 4,
  pendentesAprovacao: 2,
  processosRecentes: 8,
};
