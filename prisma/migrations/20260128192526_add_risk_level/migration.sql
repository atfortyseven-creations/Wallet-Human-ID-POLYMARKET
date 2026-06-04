-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW';
