import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProcessoDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  titulo: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsString()
  conteudo: string;

  @ApiProperty()
  @IsString()
  areaId: string;

  @ApiProperty()
  @IsString()
  categoria: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  publicado?: boolean;
}
