import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prioridade, StatusDemanda } from '@prisma/client';

export class AreaBuscaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  categoria: string;
}

export class UsuarioBuscaDto {
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

export class DemandaBuscaDto {
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
}

export class ProcessoBuscaDto {
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
}

export class BuscaGlobalResponseDto {
  @ApiProperty({ type: [AreaBuscaDto] })
  areas: AreaBuscaDto[];

  @ApiProperty({ type: [UsuarioBuscaDto] })
  usuarios: UsuarioBuscaDto[];

  @ApiProperty({ type: [DemandaBuscaDto] })
  demandas: DemandaBuscaDto[];

  @ApiProperty({ type: [ProcessoBuscaDto] })
  processos: ProcessoBuscaDto[];

  @ApiProperty()
  total: number;
}
