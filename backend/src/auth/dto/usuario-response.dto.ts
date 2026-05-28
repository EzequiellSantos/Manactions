import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Papel } from '@prisma/client';

export class UsuarioResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  cargo?: string;

  @ApiProperty({ enum: Papel })
  papel: Papel;

  @ApiPropertyOptional()
  areaId?: string;
}
