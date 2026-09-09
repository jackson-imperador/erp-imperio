-- Migration: add_monthly_closing
-- Compatible with PostgreSQL 15
-- DO NOT apply directly to production. Use: npx prisma migrate deploy

-- Step 1: Add unitCost to sale_order_items (nullable - historical rows will be NULL)
ALTER TABLE "sale_order_items" ADD COLUMN IF NOT EXISTS "unitCost" DECIMAL(15,4);

-- Step 2: Create monthly_closings table
CREATE TABLE IF NOT EXISTS "monthly_closings" (
    "id"              TEXT NOT NULL,
    "companyId"       TEXT NOT NULL,
    "month"           INTEGER NOT NULL,
    "year"            INTEGER NOT NULL,

    "grossRevenue"    DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discounts"       DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cancellations"   DECIMAL(15,2) NOT NULL DEFAULT 0,
    "returns"         DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netRevenue"      DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salesCount"      INTEGER NOT NULL DEFAULT 0,
    "averageTicket"   DECIMAL(15,2) NOT NULL DEFAULT 0,

    "cogs"            DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cogsIncomplete"  INTEGER NOT NULL DEFAULT 0,
    "cogsReliability" TEXT NOT NULL DEFAULT 'FULL',
    "grossProfit"     DECIMAL(15,2) NOT NULL DEFAULT 0,

    "expensesPaid"    DECIMAL(15,2) NOT NULL DEFAULT 0,
    "expensesPending" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "otherIncomes"    DECIMAL(15,2) NOT NULL DEFAULT 0,
    "otherExpenses"   DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netIncome"       DECIMAL(15,2) NOT NULL DEFAULT 0,

    "cashInitial"     DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cashInflows"     DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cashOutflows"    DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cashFinal"       DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salesReceived"   DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salesPending"    DECIMAL(15,2) NOT NULL DEFAULT 0,

    "stockInitial"    DECIMAL(15,2) NOT NULL DEFAULT 0,
    "stockPurchases"  DECIMAL(15,2) NOT NULL DEFAULT 0,
    "stockFinal"      DECIMAL(15,2) NOT NULL DEFAULT 0,
    "productsSold"    INTEGER NOT NULL DEFAULT 0,

    "status"          TEXT NOT NULL DEFAULT 'OPEN',
    "closedAt"        TIMESTAMP(3),
    "closedBy"        TEXT,
    "reopenedAt"      TIMESTAMP(3),
    "reopenedBy"      TEXT,
    "reopenReason"    TEXT,

    "commissionData"  JSONB,
    "topProducts"     JSONB,

    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_closings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "monthly_closings_companyId_idx"
    ON "monthly_closings"("companyId");

CREATE UNIQUE INDEX IF NOT EXISTS "monthly_closings_companyId_month_year_key"
    ON "monthly_closings"("companyId", "month", "year");

ALTER TABLE "monthly_closings"
    ADD CONSTRAINT "monthly_closings_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
