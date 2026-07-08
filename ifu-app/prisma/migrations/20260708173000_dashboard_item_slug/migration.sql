-- AlterTable
ALTER TABLE "DashboardItem" ADD COLUMN "slug" TEXT;

-- Backfill any dashboard items that may already exist.
UPDATE "DashboardItem" SET "slug" = "id" WHERE "slug" IS NULL;

-- AlterTable
ALTER TABLE "DashboardItem" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DashboardItem_slug_key" ON "DashboardItem"("slug");
