import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prioridade } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDemandaDto {
  @ApiProperty()
  @IsString()
  titulo: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsString()
  areaId: string;

  @ApiProperty({ enum: Prioridade, default: Prioridade.MEDIA })
  @IsEnum(Prioridade)
  prioridade: Prioridade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  prazo?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
