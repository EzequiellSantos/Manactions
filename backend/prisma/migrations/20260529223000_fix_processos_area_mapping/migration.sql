UPDATE "Processo"
SET "areaId" = (SELECT "id" FROM "Area" WHERE "slug" = 'recursos-humanos' LIMIT 1)
WHERE "titulo" IN ('Solicitação de Férias', 'Onboarding de Colaborador')
  AND EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'recursos-humanos');

UPDATE "Processo"
SET "areaId" = (SELECT "id" FROM "Area" WHERE "slug" = 'financeiro' LIMIT 1)
WHERE "titulo" = 'Reembolso de Despesas'
  AND EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'financeiro');

UPDATE "Processo"
SET "areaId" = (SELECT "id" FROM "Area" WHERE "slug" = 'tecnologia-da-informacao' LIMIT 1)
WHERE "titulo" IN ('Abertura de Chamado TI', 'Reset de Senha')
  AND EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'tecnologia-da-informacao');

UPDATE "Processo"
SET "areaId" = (SELECT "id" FROM "Area" WHERE "slug" = 'facilities' LIMIT 1)
WHERE "titulo" IN ('Solicitação de Material de Escritório', 'Reserva de Sala de Reunião')
  AND EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'facilities');

UPDATE "Processo"
SET "areaId" = (SELECT "id" FROM "Area" WHERE "slug" = 'juridico' LIMIT 1)
WHERE "titulo" = 'Aprovação de Contrato'
  AND EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'juridico');

UPDATE "Processo"
SET "areaId" = (SELECT "id" FROM "Area" WHERE "slug" = 'marketing' LIMIT 1)
WHERE "titulo" IN ('Briefing de Campanha', 'Comunicado Interno')
  AND EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'marketing');
