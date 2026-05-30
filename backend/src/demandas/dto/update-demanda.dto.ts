import { OmitType, PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateDemandaDto } from './create-demanda.dto';

export class UpdateDemandaDto extends PartialType(
  OmitType(CreateDemandaDto, ['areaId'] as const),
) {
  @ApiPropertyOptional({ description: 'Prazo de resolucao definido pelo responsavel' })
  @IsOptional()
  @IsDateString()
  prazoResolucao?: string;
}
