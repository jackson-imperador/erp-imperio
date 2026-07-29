-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'MERCADO_PAGO';
ALTER TYPE "PaymentMethod" ADD VALUE 'MERKAUP';
ALTER TYPE "PaymentMethod" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "CashDrawerMovement" ADD COLUMN     "destination" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "reason" TEXT;

-- CreateIndex
CREATE INDEX "CashDrawerMovement_type_idx" ON "CashDrawerMovement"("type");
