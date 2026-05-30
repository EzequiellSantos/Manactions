import {
  Body,
  Controller,
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
import { DemandasService } from './demandas.service';
import { AlterarStatusDto } from './dto/alterar-status.dto';
import { AtribuirDemandaDto } from './dto/atribuir-demanda.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateDemandaDto } from './dto/create-demanda.dto';
import {
  ComentarioDto,
  DemandaDetalheDto,
  DemandaEstatisticasDto,
  PaginatedDemandasDto,
} from './dto/demanda-response.dto';
import { FiltroDemandasDto } from './dto/filtro-demandas.dto';
import { UpdateDemandaDto } from './dto/update-demanda.dto';

@ApiTags('demandas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('demandas')
export class DemandasController {
  constructor(private readonly demandasService: DemandasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar demandas com filtros e paginação' })
  @ApiResponse({ status: 200, type: PaginatedDemandasDto })
  findAll(
    @Query() filtros: FiltroDemandasDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.demandasService.findAll(filtros, user);
  }

  @Get('estatisticas')
  @UseGuards(RolesGuard)
  @Roles(Papel.ADMIN, Papel.GESTOR)
  @ApiOperation({ summary: 'Estatísticas gerais de demandas' })
  @ApiResponse({ status: 200, type: DemandaEstatisticasDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  getEstatisticas() {
    return this.demandasService.getEstatisticas();
  }

  @Get(':id/comentarios')
  @ApiOperation({ summary: 'Listar comentários da demanda' })
  @ApiParam({ name: 'id', description: 'ID da demanda' })
  @ApiResponse({ status: 200, type: [ComentarioDto] })
  listarComentarios(
    @Param('id') id: string,
    @CurrentUser() user: Usuario,
  ) {
    return this.demandasService.listarComentarios(id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da demanda' })
  @ApiParam({ name: 'id', description: 'ID da demanda' })
  @ApiResponse({ status: 200, type: DemandaDetalheDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Demanda não encontrada' })
  findById(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.demandasService.findById(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova demanda' })
  @ApiResponse({ status: 201, type: DemandaDetalheDto })
  create(@Body() dto: CreateDemandaDto, @CurrentUser() user: Usuario) {
    return this.demandasService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar demanda' })
  @ApiParam({ name: 'id', description: 'ID da demanda' })
  @ApiResponse({ status: 200, type: DemandaDetalheDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDemandaDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.demandasService.update(id, dto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status da demanda' })
  @ApiParam({ name: 'id', description: 'ID da demanda' })
  @ApiResponse({ status: 200, type: DemandaDetalheDto })
  @ApiResponse({ status: 400, description: 'Transição de status inválida' })
  alterarStatus(
    @Param('id') id: string,
    @Body() dto: AlterarStatusDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.demandasService.alterarStatus(id, dto, user);
  }

  @Post(':id/assumir')
  @ApiOperation({ summary: 'Assumir demanda' })
  @ApiParam({ name: 'id', description: 'ID da demanda' })
  @ApiResponse({ status: 200, type: DemandaDetalheDto })
  assumirDemanda(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.demandasService.assumirDemanda(id, user);
  }

  @Patch(':id/atribuir')
  @ApiOperation({ summary: 'Atribuir responsavel pela demanda' })
  @ApiParam({ name: 'id', description: 'ID da demanda' })
  @ApiResponse({ status: 200, type: DemandaDetalheDto })
  @ApiResponse({ status: 403, description: 'Sem permissao' })
  atribuirDemanda(
    @Param('id') id: string,
    @Body() dto: AtribuirDemandaDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.demandasService.atribuirDemanda(id, dto, user);
  }

  @Post(':id/comentarios')
  @ApiOperation({ summary: 'Adicionar comentário à demanda' })
  @ApiParam({ name: 'id', description: 'ID da demanda' })
  @ApiResponse({ status: 201, type: ComentarioDto })
  adicionarComentario(
    @Param('id') id: string,
    @Body() dto: CreateComentarioDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.demandasService.adicionarComentario(id, dto, user);
  }
}
