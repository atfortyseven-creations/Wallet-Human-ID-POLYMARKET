-- AlterTable: Add missing columns to WatchedWallet
-- This migration was created with a new timestamp because the previous one was registered as empty

-- Add columns if they don't exist (idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WatchedWallet' AND column_name='lastValue') THEN
        ALTER TABLE "WatchedWallet" ADD COLUMN "lastValue" DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WatchedWallet' AND column_name='lastCheck') THEN
        ALTER TABLE "WatchedWallet" ADD COLUMN "lastCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WatchedWallet' AND column_name='metadata') THEN
        ALTER TABLE "WatchedWallet" ADD COLUMN "metadata" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WatchedWallet' AND column_name='note') THEN
        ALTER TABLE "WatchedWallet" ADD COLUMN "note" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WatchedWallet' AND column_name='isWhale') THEN
        ALTER TABLE "WatchedWallet" ADD COLUMN "isWhale" BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WatchedWallet' AND column_name='isSmart') THEN
        ALTER TABLE "WatchedWallet" ADD COLUMN "isSmart" BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WatchedWallet' AND column_name='change24h') THEN
        ALTER TABLE "WatchedWallet" ADD COLUMN "change24h" DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WatchedWallet' AND column_name='lastActive') THEN
        ALTER TABLE "WatchedWallet" ADD COLUMN "lastActive" TIMESTAMP(3);
    END IF;
END $$;
