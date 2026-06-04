-- AlterTable: Add missing columns to WatchedWallet
-- This fixes the schema drift between Prisma schema and production database

ALTER TABLE "WatchedWallet" ADD COLUMN IF NOT EXISTS "lastValue" DOUBLE PRECISION;
ALTER TABLE "WatchedWallet" ADD COLUMN IF NOT EXISTS "lastCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "WatchedWallet" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "WatchedWallet" ADD COLUMN IF NOT EXISTS "note" TEXT;
ALTER TABLE "WatchedWallet" ADD COLUMN IF NOT EXISTS "isWhale" BOOLEAN DEFAULT false;
ALTER TABLE "WatchedWallet" ADD COLUMN IF NOT EXISTS "isSmart" BOOLEAN DEFAULT false;
ALTER TABLE "WatchedWallet" ADD COLUMN IF NOT EXISTS "change24h" DOUBLE PRECISION;
ALTER TABLE "WatchedWallet" ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3);
