# IntraHub API

Backend da intranet corporativa **IntraHub**, construído com [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/) e PostgreSQL (Supabase).

A API centraliza gestão de áreas, usuários, demandas, processos, notificações e busca global — com autenticação via JWT do Supabase.

## Funcionalidades

- **Autenticação** — validação de JWT Supabase com auto-provisioning de usuários
- **Áreas** — CRUD, responsáveis e canais de contato
- **Usuários** — perfis, papéis (ADMIN, GESTOR, COLABORADOR) e estatísticas
- **Demandas** — workflow completo com histórico, comentários e notificações
- **Processos** — documentação interna com versionamento e publicação
- **Notificações** — in-app (Supabase Realtime) + e-mail (Resend)
- **Busca global** — áreas, usuários, demandas e processos
- **Dashboard** — dados consolidados para a home do frontend

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 10+
- Conta [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- Conta [Resend](https://resend.com/) (opcional, para e-mails)

## Instalação

```bash
# Clone o repositório e entre na pasta backend
cd backend

# Instale as dependências
npm install
```

> **Prisma 7:** o client usa `@prisma/adapter-pg` + `pg` para conexão PostgreSQL (já incluídos no `package.json`).

```bash
# Copie e configure as variáveis de ambiente
cp .env.example .env
```

Edite o `.env` com suas credenciais (veja seção abaixo).

```bash
# Gere o Prisma Client
npx prisma generate

# Sincronize o schema com o banco
npx prisma db push

# Popule o banco com dados iniciais
npx prisma db seed
```

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL do Supabase |
| `SUPABASE_URL` | URL do projeto Supabase (`https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Realtime e operações admin) |
| `SUPABASE_JWT_SECRET` | JWT Secret do Supabase (Settings → API) |
| `JWT_SECRET` | Secret para tokens internos do backend |
| `JWT_EXPIRES_IN` | Expiração dos tokens internos (ex: `7d`) |
| `RESEND_API_KEY` | API key do Resend para envio de e-mails |
| `FRONTEND_URL` | URL do frontend (CORS), ex: `http://localhost:3000` |
| `PORT` | Porta da API (padrão: `3001`) |

## Desenvolvimento

```bash
# Modo watch (hot reload)
npm run start:dev

# Build de produção
npm run build

# Executar build
npm run start:prod
```

A API estará disponível em:

- **Base:** `http://localhost:3001/api`
- **Swagger:** `http://localhost:3001/api/docs`
- **Health check:** `http://localhost:3001/api/health`

## Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes e2e
npm run test:e2e
```

## Endpoints principais

Documentação interativa completa em **`/api/docs`** (Swagger).

| Módulo | Prefixo | Descrição |
|--------|---------|-----------|
| Auth | `/api/auth` | Perfil do usuário autenticado |
| Áreas | `/api/areas` | Gestão de áreas organizacionais |
| Usuários | `/api/usuarios` | Perfis e papéis |
| Demandas | `/api/demandas` | Solicitações e workflow |
| Processos | `/api/processos` | Documentação de processos |
| Notificações | `/api/notificacoes` | Alertas in-app |
| Busca | `/api/busca` | Busca global (`?q=termo`) |
| Dashboard | `/api/dashboard` | Dados consolidados da home |
| Health | `/api/health` | Status da API e banco |

### Formato de resposta

Todas as respostas de sucesso seguem:

```json
{
  "data": { ... },
  "message": "OK",
  "statusCode": 200
}
```

Erros seguem:

```json
{
  "statusCode": 400,
  "message": "Mensagem amigável",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/demandas"
}
```

## Seed

O seed cria dados de demonstração:

- 1 admin (`admin@intrahub.com`)
- 1 colaborador + 6 gestores
- 6 áreas com canais de contato
- 10 processos publicados
- 5 demandas em diferentes status
- 3 comunicados

O seed é configurado em `prisma.config.ts` e também em `package.json`:

```bash
npx prisma db seed
# ou
npm run db:seed
```

> **Nota:** Os usuários do seed precisam existir no Supabase Auth com os mesmos e-mails para login real, ou use o `supabaseId` correspondente.

## Deploy no Railway

1. **Crie um projeto** em [railway.app](https://railway.app/) e conecte o repositório.

2. **Configure o serviço:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npx prisma db push && node dist/main`

3. **Adicione as variáveis de ambiente** (mesmas do `.env`).

4. **Banco de dados:** use o PostgreSQL do Supabase (`DATABASE_URL`) ou adicione um plugin PostgreSQL no Railway e rode `npx prisma db push`.

5. **Domínio:** configure `FRONTEND_URL` com a URL de produção do frontend para CORS.

6. **Health check:** configure o endpoint `/api/health` no Railway para monitoramento.

### Checklist pós-deploy

- [ ] `npx prisma db push` executado
- [ ] `npx prisma db seed` (opcional, ambiente de staging)
- [ ] Swagger acessível em `/api/docs`
- [ ] Health retornando `database: up`
- [ ] Frontend apontando para a URL da API

## Estrutura do projeto

```
backend/
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.ts          # Dados iniciais
├── src/
│   ├── auth/            # Autenticação Supabase JWT
│   ├── areas/           # Módulo de áreas
│   ├── usuarios/        # Módulo de usuários
│   ├── demandas/        # Módulo de demandas
│   ├── processos/       # Módulo de processos
│   ├── notificacoes/    # Notificações + e-mail
│   ├── busca/           # Busca global
│   ├── dashboard/       # Dashboard consolidado
│   ├── health/          # Health check
│   ├── common/          # Filters, interceptors, utils
│   └── prisma/          # PrismaService
└── README.md
```

## Licença

UNLICENSED — uso interno corporativo.
