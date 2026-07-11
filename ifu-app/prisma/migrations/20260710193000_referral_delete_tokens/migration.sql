ALTER TABLE "RecommendedContact"
ADD COLUMN "deleteTokenHash" TEXT,
ADD COLUMN "deleteTokenExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "RecommendedContact_deleteTokenHash_key" ON "RecommendedContact"("deleteTokenHash");
