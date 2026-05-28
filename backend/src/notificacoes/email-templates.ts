export type EmailTemplateTipo =
  | 'nova_demanda'
  | 'status_alterado'
  | 'nova_atribuicao'
  | 'novo_comentario';

interface EmailTemplateData {
  titulo?: string;
  mensagem?: string;
  link?: string;
  statusAnterior?: string;
  statusNovo?: string;
  autor?: string;
  demandaTitulo?: string;
}

export function renderEmailTemplate(
  tipo: EmailTemplateTipo,
  data: EmailTemplateData,
): string {
  const link = data.link ?? '#';
  const demandaTitulo = data.demandaTitulo ?? 'Demanda';

  const templates: Record<EmailTemplateTipo, string> = {
    nova_demanda: `
      <h2>Nova demanda aberta</h2>
      <p><strong>${demandaTitulo}</strong></p>
      <p>${data.mensagem ?? 'Uma nova demanda foi registrada na sua área.'}</p>
      <p><a href="${link}">Ver demanda</a></p>
    `,
    status_alterado: `
      <h2>Status da demanda alterado</h2>
      <p><strong>${demandaTitulo}</strong></p>
      <p>Status alterado de <strong>${data.statusAnterior}</strong> para <strong>${data.statusNovo}</strong>.</p>
      ${data.mensagem ? `<p>${data.mensagem}</p>` : ''}
      <p><a href="${link}">Ver demanda</a></p>
    `,
    nova_atribuicao: `
      <h2>Demanda assumida</h2>
      <p><strong>${demandaTitulo}</strong></p>
      <p>${data.autor ?? 'Um responsável'} assumiu sua demanda.</p>
      <p><a href="${link}">Ver demanda</a></p>
    `,
    novo_comentario: `
      <h2>Novo comentário</h2>
      <p><strong>${demandaTitulo}</strong></p>
      <p>${data.autor ?? 'Alguém'} comentou na demanda:</p>
      <blockquote>${data.mensagem ?? ''}</blockquote>
      <p><a href="${link}">Ver demanda</a></p>
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
          <strong style="color: #3B5BDB; font-size: 20px;">IntraHub</strong>
        </div>
        ${content}
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">IntraHub — Intranet Corporativa</p>
      </body>
    </html>
  `.trim();
}

export function getEmailSubject(
  tipo: EmailTemplateTipo,
  demandaTitulo?: string,
): string {
  const titulo = demandaTitulo ?? 'Demanda';
  const subjects: Record<EmailTemplateTipo, string> = {
    nova_demanda: `[IntraHub] Nova demanda: ${titulo}`,
    status_alterado: `[IntraHub] Status alterado: ${titulo}`,
    nova_atribuicao: `[IntraHub] Demanda assumida: ${titulo}`,
    novo_comentario: `[IntraHub] Novo comentário: ${titulo}`,
  };
  return subjects[tipo];
}
