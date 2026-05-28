import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificacaoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  mensagem: string;

  @ApiProperty()
  lida: boolean;

  @ApiPropertyOptional()
  link?: string;

  @ApiProperty()
  criadoEm: Date;
}

export class NotificacaoCountDto {
  @ApiProperty()
  count: number;
}
