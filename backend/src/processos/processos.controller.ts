import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Usuario } from '@prisma/client';
import { Papel } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { FiltroProcessosDto } from './dto/filtro-processos.dto';
import {
  CategoriasResponseDto,
  PaginatedProcessosDto,
  ProcessoDetalheDto,
} from './dto/processo-response.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { ProcessosService } from './processos.service';

@ApiTags('processos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processos')
export class ProcessosController {
  constructor(private readonly processosService: ProcessosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar processos com filtros e paginação' })
  @ApiResponse({ status: 200, type: PaginatedProcessosDto })
  findAll(
    @Query() filtros: FiltroProcessosDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.processosService.findAll(filtros, user);
  }

  @Get('categorias')
  @ApiOperation({ summary: 'Listar categorias únicas de processos' })
  @ApiResponse({ status: 200, type: CategoriasResponseDto })
  async findCategorias(@CurrentUser() user: Usuario) {
    const categorias = await this.processosService.findCategorias(user);
    return { categorias };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do processo (incrementa visualizações)' })
  @ApiParam({ name: 'id', description: 'ID do processo' })
  @ApiResponse({ status: 200, type: ProcessoDetalheDto })
  @ApiResponse({ status: 404, description: 'Processo não encontrado' })
  findById(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.processosService.findById(id, user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Papel.ADMIN, Papel.GESTOR)
  @ApiOperation({ summary: 'Criar processo' })
  @ApiResponse({ status: 201, type: ProcessoDetalheDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() dto: CreateProcessoDto, @CurrentUser() user: Usuario) {
    return this.processosService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Papel.ADMIN, Papel.GESTOR)
  @ApiOperation({ summary: 'Editar processo (incrementa versão)' })
  @ApiParam({ name: 'id', description: 'ID do processo' })
  @ApiResponse({ status: 200, type: ProcessoDetalheDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProcessoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.processosService.update(id, dto, user.id);
  }

  @Patch(':id/publicar')
  @UseGuards(RolesGuard)
  @Roles(Papel.ADMIN)
  @ApiOperation({ summary: 'Publicar processo' })
  @ApiParam({ name: 'id', description: 'ID do processo' })
  @ApiResponse({ status: 200, type: ProcessoDetalheDto })
  publicar(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.processosService.publicar(id, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Papel.ADMIN)
  @ApiOperation({ summary: 'Remover processo' })
  @ApiParam({ name: 'id', description: 'ID do processo' })
  @ApiResponse({ status: 200, description: 'Processo removido' })
  delete(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.processosService.delete(id, user.id);
  }
}
