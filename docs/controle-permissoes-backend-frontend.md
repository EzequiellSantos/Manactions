# Controle de Permissões por Papel e Área — Plano de Implementação

Este documento descreve o contexto, justificativa e passos detalhados para implementar controle fino de permissões (view-level) e alterações necessárias no backend para suportar flags/atribuições gerenciadas pelo admin.

**Objetivo**
- Permitir que o frontend mostre/oculte views e ações com base em permissões derivadas de `papel` e `areaId` do usuário.
- Adicionar controles finos no backend (campo `recebeDemandas`) para permitir que admins decidam se um usuário pode ser considerado responsável e receber notificações/atribuções de demandas.
- Garantir que todas as autorizações críticas ocorram no backend (não confiar somente no frontend).

Contexto atual
- Modelo Prisma: `Usuario` possui `papel` (ADMIN, GESTOR, COLABORADOR) e `areaId?: string`.
- Lógica de acesso a demandas existente: `backend/src/common/utils/demanda-permissions.ts` com `buildDemandaAccessWhere` e `canAccessDemanda` (ADMIN vê tudo; GESTOR vê área; COLABORADOR vê só suas demandas ou se for responsável).
- Endpoints existentes:
  - `GET /usuarios`, `GET /usuarios/me`, `PATCH /usuarios/me`, `PATCH /usuarios/:id/papel`, `DELETE /usuarios/:id` (admin)
  - `POST /areas/:id/responsaveis/:usuarioId` e `DELETE /areas/:id/responsaveis/:usuarioId` (adiciona/remover `areaId` do usuário)

Resumo da proposta backend
1. Adicionar flag `recebeDemandas` no modelo `Usuario` (boolean, default true).
2. Atualizar DTOs e respostas para incluir a flag.
3. Adicionar endpoint admin `PATCH /usuarios/:id` (ou estender `PATCH /usuarios/:id/papel`) que permita ao admin atualizar `areaId` e `recebeDemandas` (protegido por RolesGuard + Papel.ADMIN).
4. Atualizar funções relacionadas (ex.: notificação, listagem de possíveis responsáveis e lógica de `assumirDemanda`) para respeitar `recebeDemandas` quando aplicável.
5. Gerar migration Prisma e rodar `prisma generate`.

Passos detalhados (ordem sugerida)

**1) Atualizar Prisma schema**
- Arquivo: `backend/prisma/schema.prisma`
- Alteração: dentro do model `Usuario` adicionar:

  recebeDemandas Boolean @default(true)

- Comando para criar migration (local dev):

```bash
npx prisma migrate dev --name add-recebeDemandas-to-usuario
npx prisma generate
```

Observação: se você usa outro fluxo de migrations, adapte os comandos.

**2) Atualizar DTOs e tipos do backend**
- Arquivos a editar:
  - `backend/src/usuarios/dto/update-usuario.dto.ts` -> permitir `recebeDemandas?: boolean` como `@IsBoolean() @IsOptional()`
  - `backend/src/usuarios/dto/usuario-response.dto.ts` -> expor `recebeDemandas?: boolean` no schema de resposta
  - `backend/src/usuarios/usuarios.service.ts` -> aceitar `recebeDemandas` nas atualizações feitas por admin (adicionar método para admin atualizar `areaId`/`recebeDemandas` se preferir endpoint separado)

**3) Criar/alterar endpoint admin para atualizar `areaId` e `recebeDemandas`**
- Opções:
  - Reusar `POST /areas/:id/responsaveis/:usuarioId` para atribuir `areaId` (já existe) e criar endpoint PATCH `/usuarios/:id` para admin atualizar `recebeDemandas` e `areaId` (uma única rota para atualizar propriedades do usuário) — esta última é recomendada pela simplicidade no frontend.
- Proposta: adicionar em `backend/src/usuarios/usuarios.controller.ts`:
  - `@Patch(':id')` protegido por `RolesGuard` + `@Roles(Papel.ADMIN)`; Body -> novo DTO (p.ex. `AdminUpdateUsuarioDto`) com `areaId?: string | null` e `recebeDemandas?: boolean`.
- Implementar método em `UsuariosService` que verifica admin (p.ex. `ensureAdmin`) e atualiza o usuário.

**4) Atualizar lógica de demandas/notificações**
- Pontos de atenção:
  - Ao notificar responsáveis de nova demanda (`DemandasService.create`) atualmente itera `area.responsaveis` e envia notificações a todos. Filtrar por `recebeDemandas = true`.
  - Ao listar candidatos para assumir demanda (UI), backend pode expor endpoint de `GET /areas/:id/responsaveis` que já retorna `responsaveis` — garantir que a serialização inclua `recebeDemandas` ou que o frontend filtre usando a informação do usuário.
  - Ao permitir `assumirDemanda`, apenas permitir que usuário assuma se `recebeDemandas` for true OR o usuário for o solicitante ou admin (defina regra de negócio desejada).

Arquivos sugeridos para modificar:
- `backend/src/demandas/demandas.service.ts` (em `create`, uso de `area.responsaveis` para notificar; em `assumirDemanda` validar flag)
- `backend/src/areas/areas.service.ts` (quando `addResponsavel` seta `areaId`, pode deixar `recebeDemandas` intacto; admin PATCH pode ser usado para alterar flag quando necessário)

**5) Testes e verificação**
- Testes manuais importantes:
  - Criar usuário com `recebeDemandas=false` e confirmar que não recebe notificações nem aparece como possível responsavel.
  - Tornar um usuário `GESTOR` com `areaId` e checar visibilidade de demandas da área.
  - Confirmar que admin consegue atualizar `areaId` e `recebeDemandas` via novo endpoint.
- Opcional: adicionar testes unitários para `demanda-permissions.ts` cobrindo cenários com `recebeDemandas`.

**6) Frontend — integração (resumo)**
- Criar hook `frontend/src/hooks/use-permissions.ts` que:
  - Consome `useAuth().user` (já existe `GET /usuarios/me`) e `areas` quando necessário
  - Expõe métodos como `canOpenDemanda(areaId)`, `canViewDemanda(demanda)`, `canAssumeDemanda()`
- Atualizar `frontend/src/routes/_authenticated/admin.configuracoes.tsx` para permitir editar `areaId` e `recebeDemandas` (usar novo endpoint `PATCH /usuarios/:id` ou `POST /areas/:id/responsaveis/:usuarioId` conforme preferir)
- Atualizar listagens e formulários: usar as checagens do hook para mostrar/ocultar ações e rotas

Checklist mínimo de arquivos a alterar
- `backend/prisma/schema.prisma` (add field)
- `backend/src/usuarios/dto/update-usuario.dto.ts` (add field)
- `backend/src/usuarios/dto/usuario-response.dto.ts` (add field)
- `backend/src/usuarios/usuarios.controller.ts` (add `PATCH :id` admin)
- `backend/src/usuarios/usuarios.service.ts` (implement update logic)
- `backend/src/demandas/demandas.service.ts` (filtrar `responsaveis` por flag e validar `assumirDemanda`)
- `frontend/src/hooks/use-permissions.ts` (novo hook)
- `frontend/src/routes/_authenticated/admin.configuracoes.tsx` (UI para editar)

Tempo estimado (aprox.)
- Backend schema + migration + service/controller changes: 2–4 horas (depende de fluxo de migrations e testes locais)
- Frontend hook + integrações básicas no admin UI: 1–2 horas
- Testes manuais e ajustes: 1–2 horas

Observações de segurança e compatibilidade
- Sempre valide autorização no backend. Frontend apenas controla UX.
- Ao rodar migration, verifique staging/produção com cautela (backup/planos de rollback).

---

Se você concorda, posso:
- aplicar as mudanças no `Prisma schema` e criar a migration (local),
- adicionar as alterações mínimas no backend (`DTOs`, `controller`, `service`) e
- criar o arquivo `frontend/src/hooks/use-permissions.ts` base e um patch UI simples em `admin.configuracoes.tsx`.

Quer que eu comece a implementar automaticamente as mudanças no backend primeiro (adicionando `recebeDemandas` + endpoint admin `PATCH /usuarios/:id`)?
