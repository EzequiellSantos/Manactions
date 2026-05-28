import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AreaResumoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  slug: string;
}

export class ProcessoListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  categoria: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  versao: string;

  @ApiProperty()
  visualizacoes: number;

  @ApiProperty()
  publicado: boolean;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;

  @ApiProperty({ type: AreaResumoDto })
  area: AreaResumoDto;
}

export class ProcessoDetalheDto extends ProcessoListItemDto {
  @ApiProperty()
  conteudo: string;
}

export class PaginatedProcessosDto {
  @ApiProperty({ type: [ProcessoListItemDto] })
  data: ProcessoListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class CategoriasResponseDto {
  @ApiProperty({ type: [String] })
  categorias: string[];
}
