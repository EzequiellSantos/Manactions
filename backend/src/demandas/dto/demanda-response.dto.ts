import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prioridade, StatusDemanda } from '@prisma/client';

export class UsuarioResumoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  avatarUrl?: string;
}

export class AreaResumoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  slug: string;
}

export class DemandaListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  descricao: string;

  @ApiProperty({ enum: StatusDemanda })
  status: StatusDemanda;

  @ApiProperty({ enum: Prioridade })
  prioridade: Prioridade;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiPropertyOptional()
  prazo?: Date;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;

  @ApiProperty({ type: AreaResumoDto })
  area: AreaResumoDto;

  @ApiProperty({ type: UsuarioResumoDto })
  solicitante: UsuarioResumoDto;

  @ApiPropertyOptional({ type: UsuarioResumoDto })
  responsavel?: UsuarioResumoDto;
}

export class HistoricoEventoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty({ type: UsuarioResumoDto })
  autor: UsuarioResumoDto;
}

export class ComentarioDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  conteudo: string;

  @ApiProperty()
  criadoEm: Date;

  @ApiPropertyOptional()
  editadoEm?: Date;

  @ApiProperty({ type: UsuarioResumoDto })
  autor: UsuarioResumoDto;
}

export class AnexoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  tamanho: number;

  @ApiProperty()
  tipo: string;
}

export class DemandaDetalheDto extends DemandaListItemDto {
  @ApiProperty({ type: [HistoricoEventoDto] })
  historico: HistoricoEventoDto[];

  @ApiProperty({ type: [ComentarioDto] })
  comentarios: ComentarioDto[];

  @ApiProperty({ type: [AnexoDto] })
  anexos: AnexoDto[];
}

export class PaginatedDemandasDto {
  @ApiProperty({ type: [DemandaListItemDto] })
  data: DemandaListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class DemandaEstatisticasDto {
  @ApiProperty()
  porStatus: Record<string, number>;

  @ApiProperty()
  porPrioridade: Record<string, number>;

  @ApiProperty()
  porArea: { areaId: string; nome: string; total: number }[];

  @ApiProperty()
  mediaResolucaoDias: number;
}
