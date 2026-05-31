import { ApiPropertyOptional } from '@nestjs/swagger';
import { Papel } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export class AdminUpdateUsuarioDto {
  @ApiPropertyOptional({ enum: Papel })
  @IsOptional()
  @IsEnum(Papel)
  papel?: Papel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departamento?: string | null;

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
