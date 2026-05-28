import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { UpdatePapelDto } from './dto/update-papel.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioFiltrosDto } from './dto/usuario-filtros.dto';
import {
  UsuarioDetalheDto,
  UsuarioEstatisticasDto,
  UsuarioListItemDto,
} from './dto/usuario-response.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiResponse({ status: 200, type: [UsuarioListItemDto] })
  findAll(@Query() filtros: UsuarioFiltrosDto) {
    return this.usuariosService.findAll(filtros);
  }

  @Get('me')
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  @ApiResponse({ status: 200, type: UsuarioDetalheDto })
  getMe(@CurrentUser() user: Usuario) {
    return this.usuariosService.findById(user.id);
  }

  @Get('me/estatisticas')
  @ApiOperation({ summary: 'Estatísticas de demandas do usuário autenticado' })
  @ApiResponse({ status: 200, type: UsuarioEstatisticasDto })
  getMinhasEstatisticas(@CurrentUser() user: Usuario) {
    return this.usuariosService.getEstatisticas(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, type: UsuarioDetalheDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findById(@Param('id') id: string) {
    return this.usuariosService.findById(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiResponse({ status: 200, type: UsuarioDetalheDto })
  updateMe(@CurrentUser() user: Usuario, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.update(user.id, dto, user.id);
  }

  @Patch(':id/papel')
  @UseGuards(RolesGuard)
  @Roles(Papel.ADMIN)
  @ApiOperation({ summary: 'Atualizar papel do usuário (admin)' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, type: UsuarioDetalheDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  updatePapel(
    @Param('id') id: string,
    @Body() dto: UpdatePapelDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.usuariosService.updatePapel(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Papel.ADMIN)
  @ApiOperation({ summary: 'Desativar usuário (admin)' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, type: UsuarioDetalheDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  desativar(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.usuariosService.desativar(id, user.id);
  }
}
