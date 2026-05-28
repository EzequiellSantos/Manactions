import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prioridade, StatusDemanda } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FiltroDemandasDto {
  @ApiPropertyOptional({ enum: StatusDemanda })
  @IsOptional()
  @IsEnum(StatusDemanda)
  status?: StatusDemanda;

  @ApiPropertyOptional({ enum: Prioridade })
  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  solicitanteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsavelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
