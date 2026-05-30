-- Novos usuários passam a ter recebeDemandas = false por padrão
ALTER TABLE "Usuario" ALTER COLUMN "recebeDemandas" SET DEFAULT false;
