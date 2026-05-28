import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDemandaDto } from './create-demanda.dto';

export class UpdateDemandaDto extends PartialType(
  OmitType(CreateDemandaDto, ['areaId'] as const),
) {}
