import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Usuario } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('SUPABASE_JWT_SECRET');
    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET não configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: SupabaseJwtPayload): Promise<Usuario> {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }

    let usuario = await this.prisma.usuario.findUnique({
      where: { supabaseId: payload.sub },
    });

    if (!usuario) {
      if (!payload.email) {
        throw new UnauthorizedException('Token sem e-mail');
      }

      const nome =
        payload.user_metadata?.full_name ??
        payload.user_metadata?.name ??
        payload.email.split('@')[0];

      usuario = await this.prisma.usuario.create({
        data: {
          supabaseId: payload.sub,
          email: payload.email,
          nome,
          avatarUrl: payload.user_metadata?.avatar_url,
        },
      });
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    return usuario;
  }
}
