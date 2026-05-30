export type DemandaStatus =
  | "aberta"
  | "em_analise"
  | "em_andamento"
  | "concluida"
  | "cancelada"
  | "rejeitada";

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

export interface Anexo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  url?: string;
}

export interface ProcessoArea {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  areaId: string;
  slug?: string;
  tags?: string[];
  conteudo?: string;
  autor?: string;
  versao?: string;
  atualizadoEm?: Date;
  visualizacoes?: number;
  documentos?: Anexo[];
  relacionados?: string[];
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

export interface EventoHistorico {
  id: string;
  tipo: string;
  descricao: string;
  autorId: string;
  criadoEm: Date;
  metadados?: Record<string, unknown>;
}

export interface Comentario {
  id: string;
  autorId: string;
  texto: string;
  criadoEm: Date;
}

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  status: DemandaStatus;
  prioridade: PrioridadeDemanda;
  areaId: string;
  categoria: string;
  solicitanteId: string;
  responsavelId?: string;
  prazo?: Date;
  prazoResolucao?: Date;
  criadaEm: Date;
  atualizadaEm: Date;
  tags?: string[];
  anexos?: Anexo[];
  historico: EventoHistorico[];
  comentarios: Comentario[];
}

export interface Aviso {
  id: string;
  titulo: string;
  resumo: string;
  autor: string;
  data: string;
  destaque?: boolean;
}
