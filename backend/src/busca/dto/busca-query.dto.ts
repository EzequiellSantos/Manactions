import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class BuscaQueryDto {
  @ApiProperty({ description: 'Termo de busca', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  q: string;
}
