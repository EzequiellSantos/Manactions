import 'dotenv/config';
import {
  Papel,
  Prioridade,
  StatusDemanda,
} from '@prisma/client';
import { createPrismaClient } from '../src/prisma/prisma-client.factory';

const prisma = createPrismaClient();

const AREAS = [
  {
    nome: 'Tecnologia da Informação',
    descricao: 'Suporte técnico, infraestrutura e desenvolvimento de sistemas.',
    responsabilidades: ['Suporte', 'Infraestrutura', 'Desenvolvimento'],
    categoria: 'Operacional',
    cor: '#3B5BDB',
    icone: 'Monitor',
    canais: [
      { tipo: 'email', label: 'Suporte TI', valor: 'ti@intrahub.com' },
      { tipo: 'teams', label: 'Canal TI', valor: 'ti-intrahub' },
    ],
  },
  {
    nome: 'Recursos Humanos',
    descricao: 'Gestão de pessoas, benefícios e desenvolvimento organizacional.',
    responsabilidades: ['Admissão', 'Benefícios', 'Treinamentos'],
    categoria: 'Administrativo',
    cor: '#E64980',
    icone: 'Users',
    canais: [
      { tipo: 'email', label: 'RH', valor: 'rh@intrahub.com' },
      { tipo: 'whatsapp', label: 'WhatsApp RH', valor: '+5511999990001' },
    ],
  },
  {
    nome: 'Financeiro',
    descricao: 'Contas a pagar, reembolsos e controles financeiros.',
    responsabilidades: ['Reembolsos', 'Pagamentos', 'Orçamento'],
    categoria: 'Administrativo',
    cor: '#12B886',
    icone: 'DollarSign',
    canais: [
      { tipo: 'email', label: 'Financeiro', valor: 'financeiro@intrahub.com' },
    ],
  },
  {
    nome: 'Marketing',
    descricao: 'Comunicação interna, branding e campanhas.',
    responsabilidades: ['Comunicação', 'Eventos', 'Branding'],
    categoria: 'Estratégico',
    cor: '#FA5252',
    icone: 'Megaphone',
    canais: [
      { tipo: 'email', label: 'Marketing', valor: 'marketing@intrahub.com' },
      { tipo: 'discord', label: 'Discord Marketing', valor: 'marketing-hub' },
    ],
  },
  {
    nome: 'Jurídico',
    descricao: 'Contratos, compliance e assessoria legal.',
    responsabilidades: ['Contratos', 'Compliance', 'Assessoria'],
    categoria: 'Estratégico',
    cor: '#7950F2',
    icone: 'Scale',
    canais: [
      { tipo: 'email', label: 'Jurídico', valor: 'juridico@intrahub.com' },
    ],
  },
  {
    nome: 'Facilities',
    descricao: 'Manutenção predial, limpeza e serviços gerais.',
    responsabilidades: ['Manutenção', 'Limpeza', 'Recepção'],
    categoria: 'Operacional',
    cor: '#F59F00',
    icone: 'Building',
    canais: [
      { tipo: 'email', label: 'Facilities', valor: 'facilities@intrahub.com' },
      { tipo: 'outro', label: 'Ramal', valor: '2000' },
    ],
  },
];

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 Iniciando seed do IntraHub...');

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@intrahub.com' },
    update: {},
    create: {
      supabaseId: 'seed-admin-supabase-id',
      nome: 'Administrador IntraHub',
      email: 'admin@intrahub.com',
      cargo: 'Administrador do Sistema',
      departamento: 'TI',
      papel: Papel.ADMIN,
    },
  });

  const colaborador = await prisma.usuario.upsert({
    where: { email: 'colaborador@intrahub.com' },
    update: {},
    create: {
      supabaseId: 'seed-colaborador-supabase-id',
      nome: 'Maria Colaboradora',
      email: 'colaborador@intrahub.com',
      cargo: 'Analista',
      departamento: 'Operações',
      papel: Papel.COLABORADOR,
    },
  });

  const areasCriadas = [];

  for (const [index, areaData] of AREAS.entries()) {
    const slug = slugify(areaData.nome);

    const gestor = await prisma.usuario.upsert({
      where: { email: `gestor.${slug}@intrahub.com` },
      update: {},
      create: {
        supabaseId: `seed-gestor-${slug}`,
        nome: `Gestor ${areaData.nome}`,
        email: `gestor.${slug}@intrahub.com`,
        cargo: 'Gestor de Área',
        departamento: areaData.nome,
        papel: Papel.GESTOR,
      },
    });

    const area = await prisma.area.upsert({
      where: { slug },
      update: {},
      create: {
        nome: areaData.nome,
        slug,
        descricao: areaData.descricao,
        responsabilidades: areaData.responsabilidades,
        categoria: areaData.categoria,
        cor: areaData.cor,
        icone: areaData.icone,
        canaisContato: { create: areaData.canais },
      },
    });

    await prisma.usuario.update({
      where: { id: gestor.id },
      data: { areaId: area.id },
    });

    areasCriadas.push({ area, gestor, index });
    console.log(`  ✓ Área: ${area.nome}`);
  }

  const processosTemplates = [
    { titulo: 'Solicitação de Férias', categoria: 'RH', tags: ['rh', 'férias'] },
    { titulo: 'Reembolso de Despesas', categoria: 'Financeiro', tags: ['financeiro'] },
    { titulo: 'Abertura de Chamado TI', categoria: 'TI', tags: ['ti', 'suporte'] },
    { titulo: 'Solicitação de Material de Escritório', categoria: 'Facilities', tags: ['facilities'] },
    { titulo: 'Aprovação de Contrato', categoria: 'Jurídico', tags: ['jurídico'] },
    { titulo: 'Briefing de Campanha', categoria: 'Marketing', tags: ['marketing'] },
    { titulo: 'Onboarding de Colaborador', categoria: 'RH', tags: ['rh', 'onboarding'] },
    { titulo: 'Reset de Senha', categoria: 'TI', tags: ['ti', 'acesso'] },
    { titulo: 'Reserva de Sala de Reunião', categoria: 'Facilities', tags: ['facilities'] },
    { titulo: 'Comunicado Interno', categoria: 'Marketing', tags: ['comunicação'] },
  ];

  for (let i = 0; i < processosTemplates.length; i++) {
    const template = processosTemplates[i];
    const { area } = areasCriadas[i % areasCriadas.length];
    const slug = `${slugify(template.titulo)}-${i + 1}`;

    await prisma.processo.upsert({
      where: { slug },
      update: {},
      create: {
        titulo: template.titulo,
        slug,
        descricao: `Processo padrão: ${template.titulo}`,
        conteudo: `# ${template.titulo}\n\nEste é o conteúdo do processo "${template.titulo}". Siga os passos descritos pela área responsável.`,
        areaId: area.id,
        categoria: template.categoria,
        tags: template.tags,
        publicado: true,
        versao: '1.0',
      },
    });
  }
  console.log('  ✓ 10 processos publicados');

  const demandasSeed = [
    {
      titulo: 'Computador não liga',
      descricao: 'Estação de trabalho não inicializa após atualização.',
      status: StatusDemanda.ABERTA,
      prioridade: Prioridade.ALTA,
      areaIndex: 0,
      solicitanteId: colaborador.id,
    },
    {
      titulo: 'Solicitação de home office',
      descricao: 'Pedido de trabalho remoto por 2 dias na semana.',
      status: StatusDemanda.EM_ANALISE,
      prioridade: Prioridade.MEDIA,
      areaIndex: 1,
      solicitanteId: colaborador.id,
    },
    {
      titulo: 'Reembolso viagem SP',
      descricao: 'Reembolso de despesas da viagem a São Paulo.',
      status: StatusDemanda.EM_ANDAMENTO,
      prioridade: Prioridade.MEDIA,
      areaIndex: 2,
      solicitanteId: colaborador.id,
    },
    {
      titulo: 'Banner evento interno',
      descricao: 'Criação de banner para evento de integração.',
      status: StatusDemanda.CONCLUIDA,
      prioridade: Prioridade.BAIXA,
      areaIndex: 3,
      solicitanteId: admin.id,
    },
    {
      titulo: 'Revisão de contrato fornecedor',
      descricao: 'Análise jurídica de contrato de prestação de serviços.',
      status: StatusDemanda.REJEITADA,
      prioridade: Prioridade.URGENTE,
      areaIndex: 4,
      solicitanteId: admin.id,
    },
  ];

  for (const demanda of demandasSeed) {
    const { area, gestor } = areasCriadas[demanda.areaIndex];

    const existing = await prisma.demanda.findFirst({
      where: { titulo: demanda.titulo },
    });

    if (existing) {
      continue;
    }

    const created = await prisma.demanda.create({
      data: {
        titulo: demanda.titulo,
        descricao: demanda.descricao,
        status: demanda.status,
        prioridade: demanda.prioridade,
        tags: ['seed'],
        areaId: area.id,
        solicitanteId: demanda.solicitanteId,
        responsavelId:
          demanda.status !== StatusDemanda.ABERTA ? gestor.id : undefined,
      },
    });

    await prisma.historicoEvento.create({
      data: {
        tipo: 'DEMANDA_CRIADA',
        descricao: 'Demanda criada via seed',
        demandaId: created.id,
        autorId: demanda.solicitanteId,
      },
    });
  }
  console.log('  ✓ 5 demandas de exemplo');

  const comunicados = [
    {
      titulo: 'Bem-vindo ao IntraHub',
      mensagem: 'A intranet corporativa está no ar! Explore áreas, processos e demandas.',
    },
    {
      titulo: 'Manutenção programada',
      mensagem: 'Haverá manutenção no sistema no próximo domingo às 02h.',
    },
    {
      titulo: 'Nova política de home office',
      mensagem: 'Confira a nova política de trabalho remoto na área de RH.',
    },
  ];

  for (const comunicado of comunicados) {
    const exists = await prisma.notificacao.findFirst({
      where: { titulo: comunicado.titulo, usuarioId: admin.id },
    });

    if (!exists) {
      await prisma.notificacao.create({
        data: {
          usuarioId: admin.id,
          tipo: 'comunicado',
          titulo: comunicado.titulo,
          mensagem: comunicado.mensagem,
        },
      });
    }
  }
  console.log('  ✓ Comunicados de exemplo');

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
