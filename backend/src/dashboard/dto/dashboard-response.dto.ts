import { ApiProperty } from '@nestjs/swagger';

export class EstatisticasGeraisDto {
  @ApiProperty()
  totalAreas: number;

  @ApiProperty()
  totalDemandasAbertas: number;

  @ApiProperty()
  totalDemandasPendentesAprovacao: number;

  @ApiProperty()
  processosRecentes: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: EstatisticasGeraisDto })
  estatisticasGerais: EstatisticasGeraisDto;

  @ApiProperty({ type: [Object] })
  minhasDemandasRecentes: object[];

  @ApiProperty({ type: [Object] })
  areasDestaques: object[];

  @ApiProperty({ type: [Object] })
  comunicados: object[];
}
