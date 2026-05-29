import type {
  Area,
  Demanda,
  ProcessoArea,
  Responsavel,
  CanalContato,
  Anexo,
  EventoHistorico,
  Comentario,
} from "@/lib/types";

type AnyRecord = Record<string, unknown>;

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function date(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

function optionalDate(value: unknown) {
  if (!value) return undefined;
  return date(value);
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeStatus(value: unknown): Demanda["status"] {
  const raw = str(value, "ABERTA").toLowerCase();
  const map: Record<string, Demanda["status"]> = {
    aberta: "aberta",
    aberto: "aberta",
    em_analise: "em_analise",
    em_andamento: "em_andamento",
    concluida: "concluida",
    concluido: "concluida",
    cancelada: "cancelada",
    cancelado: "cancelada",
    rejeitada: "rejeitada",
    rejeitado: "rejeitada",
  };
  return map[raw] ?? "aberta";
}

function normalizePrioridade(value: unknown): Demanda["prioridade"] {
  const raw = str(value, "MEDIA").toLowerCase();
  const map: Record<string, Demanda["prioridade"]> = {
    baixa: "baixa",
    media: "media",
    média: "media",
    alta: "alta",
    urgente: "urgente",
  };
  return map[raw] ?? "media";
}

export function normalizeResponsavel(input: unknown): Responsavel {
  const item = (input ?? {}) as AnyRecord;
  return {
    id: str(item.id),
    nome: str(item.nome ?? item.name),
    cargo: str(item.cargo ?? item.role),
    email: str(item.email),
    avatar: str(item.avatar ?? item.avatarUrl ?? item.avatar_url, undefined as unknown as string),
    status: str(item.status, "ativo") as Responsavel["status"],
    areaId: str(item.areaId ?? item.area_id),
  };
}

export function normalizeCanalContato(input: unknown): CanalContato {
  const item = (input ?? {}) as AnyRecord;
  return {
    tipo: str(item.tipo ?? item.type, "outro") as CanalContato["tipo"],
    label: str(item.label),
    valor: str(item.valor ?? item.value),
    link: str(item.link, undefined as unknown as string),
  };
}

export function normalizeProcesso(input: unknown): ProcessoArea {
  const item = (input ?? {}) as AnyRecord;
  const area = (item.area ?? {}) as AnyRecord;
  return {
    id: str(item.id),
    titulo: str(item.titulo ?? item.title),
    descricao: str(item.descricao ?? item.description),
    categoria: str(item.categoria ?? item.category),
    areaId: str(item.areaId ?? item.area_id ?? area.id),
    slug: str(item.slug ?? item.id),
    tags: arr<string>(item.tags),
    conteudo: str(item.conteudo ?? item.content, undefined as unknown as string),
    autor: str(item.autor ?? item.author, undefined as unknown as string),
    versao: str(item.versao ?? item.version, undefined as unknown as string),
    atualizadoEm: optionalDate(item.atualizadoEm ?? item.atualizado_em ?? item.updatedAt ?? item.updated_at),
    visualizacoes: num(item.visualizacoes ?? item.views, 0),
    documentos: arr(item.documentos ?? item.documents).map(normalizeAnexo),
    relacionados: arr<string>(item.relacionados ?? item.related),
  };
}

export function normalizeArea(input: unknown): Area {
  const item = (input ?? {}) as AnyRecord;
  return {
    id: str(item.id),
    nome: str(item.nome ?? item.name),
    slug: str(item.slug),
    descricao: str(item.descricao ?? item.description),
    descricaoCompleta: str(item.descricaoCompleta ?? item.descricao_completa ?? item.fullDescription ?? item.full_description ?? item.descricao ?? item.description),
    responsabilidades: arr<string>(item.responsabilidades ?? item.responsibilities),
    categoria: str(item.categoria ?? item.category),
    cor: str(item.cor ?? item.color, "#2563eb"),
    icone: str(item.icone ?? item.icon, "Briefcase"),
    canaisContato: arr(item.canaisContato ?? item.canais_contato ?? item.contactChannels ?? item.contact_channels).map(normalizeCanalContato),
    responsaveis: arr(item.responsaveis ?? item.responsibles).map(normalizeResponsavel),
    processos: arr(item.processos ?? item.processes).map(normalizeProcesso),
  };
}

export function normalizeAnexo(input: unknown): Anexo {
  const item = (input ?? {}) as AnyRecord;
  return {
    id: str(item.id),
    nome: str(item.nome ?? item.name),
    tipo: str(item.tipo ?? item.type),
    tamanho: str(item.tamanho ?? item.size, typeof item.tamanho === "number" ? `${item.tamanho} bytes` : ""),
    url: str(item.url, undefined as unknown as string),
  };
}

export function normalizeEvento(input: unknown): EventoHistorico {
  const item = (input ?? {}) as AnyRecord;
  const autor = (item.autor ?? item.author ?? {}) as AnyRecord;
  return {
    id: str(item.id),
    tipo: str(item.tipo ?? item.type),
    descricao: str(item.descricao ?? item.description),
    autorId: str(item.autorId ?? item.autor_id ?? item.authorId ?? item.author_id ?? autor.id),
    criadoEm: date(item.criadoEm ?? item.criado_em ?? item.createdAt ?? item.created_at),
    metadados: (item.metadados ?? item.metadata) as Record<string, unknown> | undefined,
  };
}

export function normalizeComentario(input: unknown): Comentario {
  const item = (input ?? {}) as AnyRecord;
  const autor = (item.autor ?? item.author ?? {}) as AnyRecord;
  return {
    id: str(item.id),
    autorId: str(item.autorId ?? item.autor_id ?? item.authorId ?? item.author_id ?? autor.id),
    texto: str(item.texto ?? item.text ?? item.conteudo ?? item.content),
    criadoEm: date(item.criadoEm ?? item.criado_em ?? item.createdAt ?? item.created_at),
  };
}

export function normalizeDemanda(input: unknown): Demanda {
  const item = (input ?? {}) as AnyRecord;
  const area = (item.area ?? {}) as AnyRecord;
  const solicitante = (item.solicitante ?? item.requester ?? {}) as AnyRecord;
  const responsavel = (item.responsavel ?? item.assignee ?? {}) as AnyRecord;
  return {
    id: str(item.id),
    titulo: str(item.titulo ?? item.title),
    descricao: str(item.descricao ?? item.description),
    status: normalizeStatus(item.status),
    prioridade: normalizePrioridade(item.prioridade ?? item.priority),
    areaId: str(item.areaId ?? item.area_id ?? area.id),
    categoria: str(item.categoria ?? item.category),
    solicitanteId: str(item.solicitanteId ?? item.solicitante_id ?? item.requesterId ?? item.requester_id ?? solicitante.id),
    responsavelId: str(item.responsavelId ?? item.responsavel_id ?? item.assigneeId ?? item.assignee_id ?? responsavel.id, undefined as unknown as string),
    prazo: optionalDate(item.prazo ?? item.deadline),
    criadaEm: date(item.criadaEm ?? item.criada_em ?? item.createdAt ?? item.created_at),
    atualizadaEm: date(item.atualizadaEm ?? item.atualizada_em ?? item.updatedAt ?? item.updated_at),
    tags: arr<string>(item.tags),
    anexos: arr(item.anexos ?? item.attachments).map(normalizeAnexo),
    historico: arr(item.historico ?? item.history).map(normalizeEvento),
    comentarios: arr(item.comentarios ?? item.comments).map(normalizeComentario),
  };
}
