-- Add Missing Production Columns

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT;

-- AlterTable AuthUser
ALTER TABLE "AuthUser" ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT;
ALTER TABLE "AuthUser" ADD COLUMN IF NOT EXISTS "strigaUserId" TEXT;

-- AlterTable Session
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "fingerprint" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "isCompromised" BOOLEAN DEFAULT false;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "deviceType" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "os" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripe_customer_id_key" ON "User"("stripe_customer_id");
CREATE UNIQUE INDEX IF NOT EXISTS "AuthUser_stripe_customer_id_key" ON "AuthUser"("stripe_customer_id");
CREATE UNIQUE INDEX IF NOT EXISTS "AuthUser_strigaUserId_key" ON "AuthUser"("strigaUserId");
CREATE INDEX IF NOT EXISTS "Session_fingerprint_idx" ON "Session"("fingerprint");
