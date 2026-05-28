import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BuscaService } from './busca.service';
import { BuscaQueryDto } from './dto/busca-query.dto';
import { BuscaGlobalResponseDto } from './dto/busca-response.dto';

@ApiTags('busca')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('busca')
export class BuscaController {
  constructor(private readonly buscaService: BuscaService) {}

  @Get()
  @ApiOperation({ summary: 'Busca global em áreas, usuários, demandas e processos' })
  @ApiResponse({ status: 200, type: BuscaGlobalResponseDto })
  buscar(@Query() query: BuscaQueryDto, @CurrentUser() user: Usuario) {
    return this.buscaService.buscarGlobal(query.q, user);
  }
}
