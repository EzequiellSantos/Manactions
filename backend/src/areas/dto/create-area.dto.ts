import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsHexColor,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateCanalContatoDto } from './create-canal-contato.dto';

export class CreateAreaDto {
  @ApiProperty({ minLength: 3 })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiPropertyOptional({
    description: 'Gerado automaticamente a partir do nome se omitido',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  responsabilidades: string[];

  @ApiProperty()
  @IsString()
  categoria: string;

  @ApiProperty({ example: '#3B5BDB' })
  @IsHexColor()
  cor: string;

  @ApiProperty({ example: 'Building' })
  @IsString()
  icone: string;

  @ApiPropertyOptional({ type: [CreateCanalContatoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCanalContatoDto)
  canaisContato?: CreateCanalContatoDto[];
}
