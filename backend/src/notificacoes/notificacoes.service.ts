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
  private readonly emailFrom: string;

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
    this.emailFrom = configService.get<string>(
      'RESEND_FROM',
      'Manactions <onboarding@resend.dev>',
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
  ): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY nao configurada - e-mail nao enviado');
      return false;
    }

    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: para,
        subject: assunto,
        html,
      });
      return true;
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail para ${para}`, error);
      return false;
    }
  }

  async enviarEmailTemplate(
    para: string,
    tipo: EmailTemplateTipo,
    data: Parameters<typeof renderEmailTemplate>[1],
  ): Promise<boolean> {
    const html = renderEmailTemplate(tipo, data);
    const subject = getEmailSubject(tipo, data.demandaTitulo);
    return this.enviarEmail(para, subject, html);
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
      throw new NotFoundException('Notificacao nao encontrada');
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
      this.logger.warn('Supabase nao configurado - realtime nao enviado');
      return;
    }

    const channel = this.supabase.channel(`notificacoes:${usuarioId}`);

    try {
      await channel.httpSend('nova_notificacao', notificacao);
    } catch (error) {
      this.logger.error(
        `Falha ao enviar realtime para usuario ${usuarioId}`,
        error,
      );
    } finally {
      await this.supabase.removeChannel(channel);
    }
  }
}
