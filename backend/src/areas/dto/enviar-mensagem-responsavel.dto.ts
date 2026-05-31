import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EnviarMensagemResponsavelDto {
  @ApiProperty({ example: 'Duvida sobre solicitacao interna' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  assunto: string;

  @ApiProperty({ example: 'Ola, preciso de apoio com...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  mensagem: string;
}
