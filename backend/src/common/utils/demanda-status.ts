import { BadRequestException } from '@nestjs/common';
import { StatusDemanda } from '@prisma/client';

const STATUS_FINAIS: StatusDemanda[] = [
  StatusDemanda.CONCLUIDA,
  StatusDemanda.CANCELADA,
  StatusDemanda.REJEITADA,
];

export function validarTransicaoStatus(
  statusAtual: StatusDemanda,
  novoStatus: StatusDemanda,
): void {
  if (statusAtual === novoStatus) {
    return;
  }

  if (STATUS_FINAIS.includes(statusAtual)) {
    throw new BadRequestException(
      `Demandas com status "${STATUS_LABELS[statusAtual]}" não podem voltar para outro status`,
    );
  }
}

export const STATUS_LABELS: Record<StatusDemanda, string> = {
  [StatusDemanda.ABERTA]: 'Aberta',
  [StatusDemanda.EM_ANALISE]: 'Em análise',
  [StatusDemanda.EM_ANDAMENTO]: 'Em andamento',
  [StatusDemanda.CONCLUIDA]: 'Concluída',
  [StatusDemanda.CANCELADA]: 'Cancelada',
  [StatusDemanda.REJEITADA]: 'Rejeitada',
};
