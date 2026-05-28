import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Usuario } from '@prisma/client';
import { CurrentUser } from './decorators/current-user.decorator';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiResponse({ status: 200, type: UsuarioResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getMe(@CurrentUser() user: Usuario): UsuarioResponseDto {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo ?? undefined,
      papel: user.papel,
      areaId: user.areaId ?? undefined,
    };
  }
}
