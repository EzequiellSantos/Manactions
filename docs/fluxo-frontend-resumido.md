# Fluxo Resumido do Frontend

## Tecnologias do frontend

- React
- TypeScript
- Vite
- TanStack Start
- TanStack Router
- TanStack Query
- Tailwind CSS
- Radix UI
- Lucide React
- Supabase Auth
- Vercel para hospedagem

## 1. Acesso e usuario

1. O usuario acessa a aplicacao pelo navegador.
2. Se nao estiver autenticado, e redirecionado para a tela de login.
3. O login e feito via Supabase Auth.
4. Apos autenticar, o frontend consulta o backend para identificar o usuario corporativo.
5. Caso o usuario ainda nao exista na base interna, o backend pode criar o registro inicial vinculado ao Supabase.

## 2. Perfil corporativo

1. O usuario nao edita livremente seu perfil corporativo.
2. Dados como nome, papel, area, departamento e permissao para receber demandas sao gerenciados pelo admin.
3. O frontend usa essas informacoes para liberar ou bloquear funcionalidades.

## 3. Navegacao principal

1. Apos login, o usuario entra na dashboard.
2. O menu lateral permite acessar:
   - Dashboard
   - Areas
   - Demandas
   - Processos
   - Configuracoes
   - Admin, quando permitido
3. No mobile, a navegacao acontece pelo menu lateral responsivo.

## 4. Areas

1. O usuario visualiza as areas cadastradas.
2. Ao selecionar uma area, ve informacoes gerais, responsaveis, processos e opcao de abrir demanda.
3. As categorias de demanda sao exibidas conforme a area selecionada.

## 5. Criacao de demanda

1. O usuario escolhe a area da demanda.
2. Em seguida, informa titulo, categoria, descricao, prioridade e prazo desejado.
3. Ao enviar, a demanda e criada no backend vinculada ao usuario solicitante.
4. A demanda passa a aparecer em "Minhas Demandas" para quem abriu.

## 6. Listagem de demandas

1. O usuario acessa a tela de demandas.
2. Pode visualizar demandas abertas por ele e, conforme permissao, outras demandas.
3. A tela permite filtrar por status, prioridade, periodo, area e texto.
4. Cada demanda pode ser aberta para visualizacao detalhada.

## 7. Detalhe da demanda

1. O usuario ve os dados principais da demanda.
2. Tambem visualiza responsavel, prazos, status e historico.
3. Comentarios aparecem em formato cronologico.
4. Notificacoes relacionadas podem levar diretamente para a demanda.

## 8. Triagem e atribuicao

1. Gestores e admins visualizam controles de triagem.
2. Eles podem atribuir demandas para usuarios aptos a receber demandas.
3. Apenas usuarios com a flag "recebeDemandas" podem ser escolhidos como responsaveis.
4. Gestores atuam sobre sua area; admins podem atuar de forma ampla.

## 9. Gerenciamento da demanda

1. O responsavel pode assumir ou gerenciar a demanda.
2. Pode atualizar o status conforme o andamento.
3. Pode definir um prazo estimado de resolucao.
4. A demanda pode ser concluida, rejeitada, cancelada ou mantida em andamento, conforme permissao.

## 10. Notificacoes

1. O frontend exibe notificacoes no topo da aplicacao.
2. Ao clicar em uma notificacao, o usuario e levado ao item relacionado.
3. A notificacao clicada e marcada como lida.

## Resumo geral

O fluxo principal e:

```text
Login -> Dashboard -> Areas/Demandas -> Criar demanda -> Triagem -> Atribuicao -> Execucao -> Conclusao
```

O frontend atua como interface de navegacao, filtros, formularios e controle visual de permissoes, enquanto o backend valida autenticacao, permissoes e persistencia dos dados.

# Fluxo Resumido do Backend

## Tecnologias do backend

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- Supabase Postgres
- Supabase Auth
- Passport JWT
- Swagger/OpenAPI
- Railway para hospedagem

## 1. Recebimento das requisicoes

1. O frontend chama a API usando rotas iniciadas em `/api`.
2. O backend recebe a requisicao no NestJS.
3. Rotas protegidas exigem token JWT enviado pelo frontend.

## 2. Autenticacao

1. O backend valida o token do Supabase.
2. Apos validar, busca o usuario interno pelo `supabaseId`.
3. Se necessario, cria ou sincroniza o usuario na base interna.
4. O usuario autenticado fica disponivel para os controllers e services.

## 3. Permissoes

1. O backend verifica papel, area e flags do usuario.
2. Os principais papeis sao admin, gestor e colaborador.
3. Admins possuem acesso mais amplo.
4. Gestores atuam principalmente sobre sua propria area.
5. Colaboradores acessam principalmente suas proprias demandas e dados permitidos.

## 4. Areas e processos

1. O backend lista areas ativas.
2. Cada area possui responsaveis, processos e dados de configuracao.
3. Processos podem ser criados ou editados conforme permissao.
4. Admins podem gerenciar qualquer area; gestores gerenciam sua area.

## 5. Criacao de demandas

1. O backend recebe os dados enviados pelo frontend.
2. Valida area, categoria, prioridade, prazo e usuario solicitante.
3. Cria a demanda no banco.
4. Registra historico inicial.
5. Pode gerar notificacoes para envolvidos.

## 6. Listagem e filtros

1. O backend retorna demandas conforme permissao do usuario.
2. Filtros podem considerar status, prioridade, area, periodo e texto.
3. O retorno e usado pelo frontend para montar tabelas, cards e indicadores.

## 7. Triagem e atribuicao

1. Gestores e admins podem atribuir demandas.
2. O backend valida se o responsavel pode receber demandas.
3. Apenas usuarios com `recebeDemandas` ativo podem ser responsaveis.
4. A atribuicao atualiza a demanda, registra historico e pode enviar notificacao.

## 8. Gerenciamento de status

1. Responsaveis autorizados podem alterar o status da demanda.
2. O backend valida transicoes e permissao.
3. Tambem permite definir prazo estimado de resolucao.
4. Mudancas relevantes sao registradas no historico.

## 9. Comentarios e notificacoes

1. Comentarios sao salvos vinculados a demanda e ao autor.
2. O backend retorna comentarios em ordem cronologica.
3. Notificacoes sao criadas para eventos importantes.
4. Ao marcar como lida, o backend atualiza o registro da notificacao.

## Resumo geral do backend

```text
Receber requisicao -> Validar token -> Resolver usuario -> Aplicar permissoes -> Consultar/alterar banco -> Retornar dados
```

O backend concentra as regras de negocio, validacao de permissao, persistencia no banco e integracao com Supabase.
