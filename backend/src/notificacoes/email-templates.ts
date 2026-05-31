export type EmailTemplateTipo =
  | 'nova_demanda'
  | 'status_alterado'
  | 'nova_atribuicao'
  | 'novo_comentario'
  | 'mensagem_responsavel';

interface EmailTemplateData {
  titulo?: string;
  mensagem?: string;
  link?: string;
  statusAnterior?: string;
  statusNovo?: string;
  autor?: string;
  demandaTitulo?: string;
  areaNome?: string;
  assunto?: string;
  remetenteEmail?: string;
}

export function renderEmailTemplate(
  tipo: EmailTemplateTipo,
  data: EmailTemplateData,
): string {
  const link = data.link ?? '#';
  const demandaTitulo = escapeHtml(data.demandaTitulo ?? 'Demanda');
  const mensagem = escapeHtml(data.mensagem ?? '');
  const autor = escapeHtml(data.autor ?? '');
  const areaNome = escapeHtml(data.areaNome ?? 'área');
  const assunto = escapeHtml(data.assunto ?? 'Mensagem');
  const remetenteEmail = escapeHtml(data.remetenteEmail ?? '');

  const templates: Record<EmailTemplateTipo, string> = {
    nova_demanda: `
      <h2>Nova demanda aberta</h2>
      <p><strong>${demandaTitulo}</strong></p>
      <p>${mensagem || 'Uma nova demanda foi registrada na sua área.'}</p>
      <p><a href="${link}">Ver demanda</a></p>
    `,
    status_alterado: `
      <h2>Status da demanda alterado</h2>
      <p><strong>${demandaTitulo}</strong></p>
      <p>Status alterado de <strong>${escapeHtml(data.statusAnterior ?? '')}</strong> para <strong>${escapeHtml(data.statusNovo ?? '')}</strong>.</p>
      ${mensagem ? `<p>${mensagem}</p>` : ''}
      <p><a href="${link}">Ver demanda</a></p>
    `,
    nova_atribuicao: `
      <h2>Demanda assumida</h2>
      <p><strong>${demandaTitulo}</strong></p>
      <p>${autor || 'Um responsável'} assumiu sua demanda.</p>
      <p><a href="${link}">Ver demanda</a></p>
    `,
    novo_comentario: `
      <h2>Novo comentário</h2>
      <p><strong>${demandaTitulo}</strong></p>
      <p>${autor || 'Alguém'} comentou na demanda:</p>
      <blockquote>${mensagem}</blockquote>
      <p><a href="${link}">Ver demanda</a></p>
    `,
    mensagem_responsavel: `
      <h2>Nova mensagem para ${areaNome}</h2>
      <p><strong>${assunto}</strong></p>
      <p>${autor || 'Um usuário'} enviou uma mensagem pela página de responsáveis da área.</p>
      ${remetenteEmail ? `<p><strong>Responder para:</strong> ${remetenteEmail}</p>` : ''}
      <blockquote>${mensagem.replace(/\n/g, '<br />')}</blockquote>
    `,
  };

  return wrapEmailHtml(templates[tipo]);
}

function wrapEmailHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="border-bottom: 3px solid #3B5BDB; padding-bottom: 16px; margin-bottom: 24px;">
          <strong style="color: #3B5BDB; font-size: 20px;">Manactions</strong>
        </div>
        ${content}
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">Manactions - Intranet Corporativa</p>
      </body>
    </html>
  `.trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getEmailSubject(
  tipo: EmailTemplateTipo,
  demandaTitulo?: string,
): string {
  const titulo = demandaTitulo ?? 'Demanda';
  const subjects: Record<EmailTemplateTipo, string> = {
    nova_demanda: `[Manactions] Nova demanda: ${titulo}`,
    status_alterado: `[Manactions] Status alterado: ${titulo}`,
    nova_atribuicao: `[Manactions] Demanda assumida: ${titulo}`,
    novo_comentario: `[Manactions] Novo comentário: ${titulo}`,
    mensagem_responsavel: `[Manactions] ${titulo}`,
  };
  return subjects[tipo];
}
