import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AreaFiltrosDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria?: string;
}
