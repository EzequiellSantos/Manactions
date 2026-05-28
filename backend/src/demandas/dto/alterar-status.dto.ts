import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusDemanda } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AlterarStatusDto {
  @ApiProperty({ enum: StatusDemanda })
  @IsEnum(StatusDemanda)
  status: StatusDemanda;

  @ApiPropertyOptional({ description: 'Motivo da mudança de status' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
