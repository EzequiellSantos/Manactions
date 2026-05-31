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
import { AreasService } from './areas.service';
import {
  AreaDetalheDto,
  AreaListItemDto,
  ResponsavelResumoDto,
} from './dto/area-response.dto';
import { AreaFiltrosDto } from './dto/area-filtros.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { EnviarMensagemResponsavelDto } from './dto/enviar-mensagem-responsavel.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@ApiTags('areas')
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar áreas ativas' })
  @ApiResponse({ status: 200, type: [AreaListItemDto] })
  findAll(@Query() filtros: AreaFiltrosDto) {
    return this.areasService.findAll(filtros);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Buscar área por slug' })
  @ApiParam({ name: 'slug', description: 'Slug da área' })
  @ApiResponse({ status: 200, type: AreaDetalheDto })
  @ApiResponse({ status: 404, description: 'Área não encontrada' })
  findBySlug(@Param('slug') slug: string) {
    return this.areasService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Papel.ADMIN, Papel.GESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova área' })
  @ApiResponse({ status: 201, type: AreaListItemDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() dto: CreateAreaDto, @CurrentUser() user: Usuario) {
    return this.areasService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Papel.ADMIN, Papel.GESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar área' })
  @ApiParam({ name: 'id', description: 'ID da área' })
  @ApiResponse({ status: 200, type: AreaListItemDto })
  @ApiResponse({ status: 404, description: 'Área não encontrada' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAreaDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.areasService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Papel.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desativar área (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID da área' })
  @ApiResponse({ status: 200, description: 'Área desativada' })
  @ApiResponse({ status: 404, description: 'Área não encontrada' })
  delete(@Param('id') id: string) {
    return this.areasService.delete(id);
  }

  @Post(':id/responsaveis/:usuarioId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Papel.ADMIN, Papel.GESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar responsável à área' })
  @ApiParam({ name: 'id', description: 'ID da área' })
  @ApiParam({ name: 'usuarioId', description: 'ID do usuário' })
  @ApiResponse({ status: 201, type: ResponsavelResumoDto })
  addResponsavel(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.areasService.addResponsavel(id, usuarioId);
  }

  @Delete(':id/responsaveis/:usuarioId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Papel.ADMIN, Papel.GESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover responsável da área' })
  @ApiParam({ name: 'id', description: 'ID da área' })
  @ApiParam({ name: 'usuarioId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, type: ResponsavelResumoDto })
  removeResponsavel(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.areasService.removeResponsavel(id, usuarioId);
  }

  @Post(':id/responsaveis/:usuarioId/mensagem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensagem por e-mail ao responsavel' })
  @ApiParam({ name: 'id', description: 'ID da area' })
  @ApiParam({ name: 'usuarioId', description: 'ID do responsavel' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  enviarMensagemResponsavel(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
    @Body() dto: EnviarMensagemResponsavelDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.areasService.enviarMensagemResponsavel(id, usuarioId, dto, {
      nome: user.nome,
      email: user.email,
    });
  }
}
