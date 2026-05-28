import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notificacao } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import {
  EmailTemplateTipo,
  getEmailSubject,
  renderEmailTemplate,
} from './email-templates';

@Injectable()
export class NotificacoesService {
  private readonly logger = new Logger(NotificacoesService.name);
  private readonly resend: Resend | null;
  private readonly supabase: SupabaseClient | null;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const resendKey = configService.get<string>('RESEND_API_KEY');
    this.resend = resendKey ? new Resend(resendKey) : null;

    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.supabase =
      supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey)
        : null;

    this.frontendUrl = configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  async criarNotificacao(
    usuarioId: string,
    tipo: string,
    titulo: string,
    mensagem: string,
    link?: string,
  ): Promise<Notificacao> {
    const notificacao = await this.prisma.notificacao.create({
      data: {
        usuarioId,
        tipo,
        titulo,
        mensagem,
        link,
      },
    });

    await this.broadcastRealtime(usuarioId, notificacao);

    return notificacao;
  }

  async enviarEmail(
    para: string,
    assunto: string,
    html: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY não configurada — e-mail não enviado');
      return;
    }

    try {
      await this.resend.emails.send({
        from: 'IntraHub <noreply@intrahub.com>',
        to: para,
        subject: assunto,
        html,
      });
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail para ${para}`, error);
    }
  }

  async enviarEmailTemplate(
    para: string,
    tipo: EmailTemplateTipo,
    data: Parameters<typeof renderEmailTemplate>[1],
  ): Promise<void> {
    const html = renderEmailTemplate(tipo, data);
    const subject = getEmailSubject(tipo, data.demandaTitulo);
    await this.enviarEmail(para, subject, html);
  }

  buildDemandaLink(demandaId: string): string {
    return `${this.frontendUrl}/demandas/${demandaId}`;
  }

  async findMinhas(usuarioId: string) {
    return this.prisma.notificacao.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
      take: 20,
    });
  }

  async marcarComoLida(id: string, usuarioId: string) {
    const notificacao = await this.prisma.notificacao.findFirst({
      where: { id, usuarioId },
    });

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });
  }

  async marcarTodasComoLidas(usuarioId: string) {
    await this.prisma.notificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true },
    });

    return { success: true };
  }

  async contarNaoLidas(usuarioId: string): Promise<number> {
    return this.prisma.notificacao.count({
      where: { usuarioId, lida: false },
    });
  }

  private async broadcastRealtime(
    usuarioId: string,
    notificacao: Notificacao,
  ): Promise<void> {
    if (!this.supabase) {
      this.logger.warn('Supabase não configurado — realtime não enviado');
      return;
    }

    try {
      const channel = this.supabase.channel(`notificacoes:${usuarioId}`);
      await channel.subscribe();
      await channel.send({
        type: 'broadcast',
        event: 'nova_notificacao',
        payload: notificacao,
      });
      await this.supabase.removeChannel(channel);
    } catch (error) {
      this.logger.error(
        `Falha ao enviar realtime para usuário ${usuarioId}`,
        error,
      );
    }
  }
}
