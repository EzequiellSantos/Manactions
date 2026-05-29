import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Papel } from '@prisma/client';

export class AreaResumoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  slug: string;
}

export class UsuarioDetalheDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  cargo?: string;

  @ApiPropertyOptional()
  departamento?: string;

  @ApiPropertyOptional()
  telefone?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiProperty({ enum: Papel })
  papel: Papel;

  @ApiProperty()
  ativo: boolean;

  @ApiProperty()
  notificacoesEmail: boolean;

  @ApiProperty()
  notificacoesInApp: boolean;

  @ApiPropertyOptional()
  areaId?: string;

  @ApiPropertyOptional({ type: AreaResumoDto })
  area?: AreaResumoDto;

  @ApiProperty()
  recebeDemandas: boolean;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;
}

export class UsuarioListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  cargo?: string;

  @ApiPropertyOptional()
  departamento?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiProperty({ enum: Papel })
  papel: Papel;

  @ApiProperty()
  ativo: boolean;

  @ApiPropertyOptional()
  areaId?: string;

  @ApiPropertyOptional({ type: AreaResumoDto })
  area?: AreaResumoDto;

  @ApiProperty()
  recebeDemandas: boolean;
}

export class UsuarioEstatisticasDto {
  @ApiProperty()
  abertas: number;

  @ApiProperty()
  concluidas: number;

  @ApiProperty()
  pendentes: number;
}
