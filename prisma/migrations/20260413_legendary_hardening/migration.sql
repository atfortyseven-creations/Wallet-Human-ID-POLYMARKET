-- migration.sql: Institutional Schema Recovery
-- Resolves P2022 by force-syncing missing columns reported in production logs.

-- 1. WHALE ACTIVITY REFINEMENT
ALTER TABLE "WhaleActivity" 
  ADD COLUMN IF NOT EXISTS "entityName" TEXT NOT NULL DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS "institutional" BOOLEAN NOT NULL DEFAULT false;

-- 2. TRANSACTION REFINEMENT
ALTER TABLE "Transaction"
  ADD COLUMN IF NOT EXISTS "chainId" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}';

-- 3. BLOCKCHAIN TRANSACTION REFINEMENT
ALTER TABLE "BlockchainTransaction"
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'SWAP',
  ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}';

-- 4. ON-CHAIN ENTITY REFINEMENT
ALTER TABLE "OnChainEntity"
  ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- 5. ENSURE UNIQUE INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS "WhaleActivity_transactionHash_key" ON "WhaleActivity"("transactionHash");
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_txHash_key" ON "Transaction"("txHash");
