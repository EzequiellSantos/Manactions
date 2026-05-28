import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  NotificacaoCountDto,
  NotificacaoResponseDto,
} from './dto/notificacao-response.dto';
import { NotificacoesService } from './notificacoes.service';

@ApiTags('notificacoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar minhas notificações' })
  @ApiResponse({ status: 200, type: [NotificacaoResponseDto] })
  findMinhas(@CurrentUser() user: Usuario) {
    return this.notificacoesService.findMinhas(user.id);
  }

  @Get('nao-lidas/contagem')
  @ApiOperation({ summary: 'Contagem de notificações não lidas' })
  @ApiResponse({ status: 200, type: NotificacaoCountDto })
  async contarNaoLidas(@CurrentUser() user: Usuario) {
    const count = await this.notificacoesService.contarNaoLidas(user.id);
    return { count };
  }

  @Patch('todas-lidas')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Notificações marcadas como lidas' })
  marcarTodasComoLidas(@CurrentUser() user: Usuario) {
    return this.notificacoesService.marcarTodasComoLidas(user.id);
  }

  @Patch(':id/lida')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({ status: 200, type: NotificacaoResponseDto })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  marcarComoLida(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.notificacoesService.marcarComoLida(id, user.id);
  }
}
