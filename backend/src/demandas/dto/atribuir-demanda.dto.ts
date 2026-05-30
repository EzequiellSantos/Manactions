import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AtribuirDemandaDto {
  @ApiProperty({ description: 'ID do usuario que recebera a demanda' })
  @IsString()
  responsavelId: string;
}
