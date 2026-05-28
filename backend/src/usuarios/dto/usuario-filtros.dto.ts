import { ApiPropertyOptional } from '@nestjs/swagger';
import { Papel } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UsuarioFiltrosDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiPropertyOptional({ enum: Papel })
  @IsOptional()
  @IsEnum(Papel)
  papel?: Papel;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  ativo?: boolean;
}
