-- CreateTable
CREATE TABLE "ProductPassport" (
    "id" TEXT NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "issuerAddress" TEXT,
    "payload" JSONB NOT NULL,
    "coreEntropy" TEXT,
    "txHash" TEXT,
    "chainId" INTEGER,
    "gs1Gtin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPassport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvenanceEvent" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProvenanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductPassport_publicSlug_key" ON "ProductPassport"("publicSlug");

-- CreateIndex
CREATE INDEX "ProductPassport_issuerAddress_idx" ON "ProductPassport"("issuerAddress");

-- CreateIndex
CREATE INDEX "ProductPassport_gs1Gtin_idx" ON "ProductPassport"("gs1Gtin");

-- CreateIndex
CREATE INDEX "ProductPassport_createdAt_idx" ON "ProductPassport"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProvenanceEvent_passportId_createdAt_idx" ON "ProvenanceEvent"("passportId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ProvenanceEvent" ADD CONSTRAINT "ProvenanceEvent_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "ProductPassport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
