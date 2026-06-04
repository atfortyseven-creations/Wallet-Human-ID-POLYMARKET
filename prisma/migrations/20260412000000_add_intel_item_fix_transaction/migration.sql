-- 
-- Migration: 20260412000000_add_intel_item_fix_transaction
-- Purpose: Create IntelItem table (missing from DB despite existing in schema)
--          and add authUserId column to Transaction table.
-- Errors fixed:
--   P1009: table "public.IntelItem" does not exist
--   P2022: column "Transaction.authUserId" does not exist
-- 

-- Create IntelItem table (was in schema but never migrated)
CREATE TABLE IF NOT EXISTS "IntelItem" (
    "id"          TEXT NOT NULL,
    "url"         TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "source"      TEXT NOT NULL,
    "aiSummary"   TEXT,
    "category"    TEXT NOT NULL DEFAULT 'FINANCE',
    "priority"    TEXT NOT NULL DEFAULT 'SOVEREIGN',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntelItem_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on url
CREATE UNIQUE INDEX IF NOT EXISTS "IntelItem_url_key" ON "IntelItem"("url");

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "IntelItem_publishedAt_idx" ON "IntelItem"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "IntelItem_category_publishedAt_idx" ON "IntelItem"("category", "publishedAt" DESC);

-- Add authUserId column to Transaction if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Transaction'
        AND column_name = 'authUserId'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "authUserId" TEXT;
        CREATE INDEX IF NOT EXISTS "Transaction_authUserId_idx" ON "Transaction"("authUserId");
    END IF;
END $$;
