import { ApiProperty } from '@nestjs/swagger';
import { Papel } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdatePapelDto {
  @ApiProperty({ enum: Papel })
  @IsEnum(Papel)
  papel: Papel;
}
