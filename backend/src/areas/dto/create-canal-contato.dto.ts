import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

const TIPOS_CANAL = ['email', 'discord', 'whatsapp', 'teams', 'outro'] as const;

export type TipoCanalContato = (typeof TIPOS_CANAL)[number];

export class CreateCanalContatoDto {
  @ApiProperty({ enum: TIPOS_CANAL })
  @IsIn(TIPOS_CANAL)
  tipo: TipoCanalContato;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  valor: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  link?: string;
}
