-- migration.sql
-- Columnas faltantes en WhaleActivity
ALTER TABLE "WhaleActivity" 
  ADD COLUMN IF NOT EXISTS "valueBTC"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "btcPriceAtTx"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "blockHeight"   INTEGER          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "blockTime"     TIMESTAMP(3)     NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "fromAddresses" TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "toAddresses"   TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "immutableId"   TEXT,
  ADD COLUMN IF NOT EXISTS "confirmed"     BOOLEAN          NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "indexedAt"     TIMESTAMP(3)     NOT NULL DEFAULT NOW();

-- Hacer immutableId único donde no sea null
CREATE UNIQUE INDEX IF NOT EXISTS "WhaleActivity_immutableId_key" 
  ON "WhaleActivity"("immutableId") WHERE "immutableId" IS NOT NULL;

-- Columna faltante en BlockchainTransaction  
ALTER TABLE "BlockchainTransaction"
  ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE INDEX IF NOT EXISTS "BlockchainTransaction_userId_idx" 
  ON "BlockchainTransaction"("userId");
