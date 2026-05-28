import { StatusDemanda } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

const TRANSICOES_PERMITIDAS: Record<StatusDemanda, StatusDemanda[]> = {
  [StatusDemanda.ABERTA]: [StatusDemanda.EM_ANALISE, StatusDemanda.CANCELADA],
  [StatusDemanda.EM_ANALISE]: [
    StatusDemanda.EM_ANDAMENTO,
    StatusDemanda.REJEITADA,
  ],
  [StatusDemanda.EM_ANDAMENTO]: [
    StatusDemanda.CONCLUIDA,
    StatusDemanda.ABERTA,
  ],
  [StatusDemanda.CONCLUIDA]: [],
  [StatusDemanda.CANCELADA]: [],
  [StatusDemanda.REJEITADA]: [],
};

export function validarTransicaoStatus(
  statusAtual: StatusDemanda,
  novoStatus: StatusDemanda,
): void {
  const permitidos = TRANSICOES_PERMITIDAS[statusAtual];

  if (!permitidos.includes(novoStatus)) {
    throw new BadRequestException(
      `Transição inválida de "${statusAtual}" para "${novoStatus}"`,
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
