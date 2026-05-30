import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

export class AdminUpdateUsuarioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((obj) => obj.areaId !== null)
  @IsString()
  areaId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  recebeDemandas?: boolean;
}
