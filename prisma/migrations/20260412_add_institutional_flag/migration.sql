-- Carga Institucional de Grado Génesis
-- Corrige la desincronización de la base de datos de Railway
ALTER TABLE "WhaleActivity" 
  ADD COLUMN IF NOT EXISTS "institutional" BOOLEAN NOT NULL DEFAULT false;

-- Índice para consultas relámpago de telemetría institicional
CREATE INDEX IF NOT EXISTS "WhaleActivity_institutional_idx" ON "WhaleActivity"("institutional");
