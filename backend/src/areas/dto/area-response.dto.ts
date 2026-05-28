import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CanalContatoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  valor: string;

  @ApiPropertyOptional()
  link?: string;
}

export class ResponsavelResumoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  cargo?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;
}

export class ProcessoResumoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  categoria: string;

  @ApiProperty()
  publicado: boolean;
}

export class AreaListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  descricao: string;

  @ApiProperty({ type: [String] })
  responsabilidades: string[];

  @ApiProperty()
  categoria: string;

  @ApiProperty()
  cor: string;

  @ApiProperty()
  icone: string;

  @ApiProperty({ type: [ResponsavelResumoDto] })
  responsaveis: ResponsavelResumoDto[];

  @ApiProperty({ type: [CanalContatoResponseDto] })
  canaisContato: CanalContatoResponseDto[];
}

export class AreaDetalheDto extends AreaListItemDto {
  @ApiProperty({ type: [ProcessoResumoDto] })
  processos: ProcessoResumoDto[];

  @ApiProperty()
  demandasAbertas: number;
}
