import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Usuario } from '@prisma/client';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly supabase: SupabaseClient;

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios');
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: Usuario }>();
    const token = this.extractBearerToken(request);

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Token invalido');
    }

    request.user = await this.findOrCreateUsuario(data.user);
    return true;
  }

  private extractBearerToken(request: Request): string {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token nao informado');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Token nao informado');
    }

    return token;
  }

  private async findOrCreateUsuario(user: User): Promise<Usuario> {
    let usuario = await this.prisma.usuario.findUnique({
      where: { supabaseId: user.id },
    });

    if (!usuario) {
      if (!user.email) {
        throw new UnauthorizedException('Token sem e-mail');
      }

      const nome =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email.split('@')[0];

      usuario = await this.prisma.usuario.create({
        data: {
          supabaseId: user.id,
          email: user.email,
          nome,
          avatarUrl: user.user_metadata?.avatar_url,
        },
      });
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuario inativo');
    }

    return usuario;
  }
}
