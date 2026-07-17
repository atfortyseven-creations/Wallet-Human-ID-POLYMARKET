-- Migration: add_verification_code_table
-- Adds the VerificationCode model (OTP codes for email login)
-- and missing fields on AuthUser (username, encryptedMnemonic, walletSalt)

-- 1. Add missing columns to AuthUser (safe: all nullable / with defaults)
ALTER TABLE "AuthUser"
  ADD COLUMN IF NOT EXISTS "username"          TEXT,
  ADD COLUMN IF NOT EXISTS "encryptedMnemonic" TEXT,
  ADD COLUMN IF NOT EXISTS "walletSalt"        TEXT;

-- 2. Unique index on username (sparse - only non-null values must be unique)
CREATE UNIQUE INDEX IF NOT EXISTS "AuthUser_username_key" ON "AuthUser"("username")
  WHERE "username" IS NOT NULL;

-- 3. Index on username for fast lookups
CREATE INDEX IF NOT EXISTS "AuthUser_username_idx" ON "AuthUser"("username");

-- 4. Create VerificationCode table
CREATE TABLE IF NOT EXISTS "VerificationCode" (
  "id"        TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT        NOT NULL,
  "code"      TEXT        NOT NULL,
  "used"      BOOLEAN     NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VerificationCode_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE
);

-- 5. Indexes for verify-code route query patterns
CREATE INDEX IF NOT EXISTS "VerificationCode_userId_used_expiresAt_idx"
  ON "VerificationCode"("userId", "used", "expiresAt");

CREATE INDEX IF NOT EXISTS "VerificationCode_code_idx"
  ON "VerificationCode"("code");
