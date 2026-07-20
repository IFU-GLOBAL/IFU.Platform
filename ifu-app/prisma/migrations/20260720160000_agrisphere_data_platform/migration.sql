-- CreateEnum
CREATE TYPE "AgriSphereActivityLevel" AS ENUM ('HIGH', 'MEDIUM', 'EMERGING', 'LOW', 'NO_DATA');

-- CreateEnum
CREATE TYPE "AgriSphereOpportunityStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "AgriSphereEventFormat" AS ENUM ('VIRTUAL', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "AgriSpherePartnerTier" AS ENUM ('INSTITUTIONAL', 'STRATEGIC', 'COMMUNITY');

-- CreateTable
CREATE TABLE "AgriSphereContinent" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "priorityCrops" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "countryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSphereContinent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSphereCountry" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "continentCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "activityLevel" "AgriSphereActivityLevel" NOT NULL DEFAULT 'NO_DATA',
    "primaryCrops" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "opportunityCount" INTEGER NOT NULL DEFAULT 0,
    "producerRank" INTEGER,
    "farmerCount" INTEGER NOT NULL DEFAULT 0,
    "partnerCount" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSphereCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSphereOpportunity" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "countryCode" TEXT,
    "region" TEXT,
    "crops" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "AgriSphereOpportunityStatus" NOT NULL DEFAULT 'ACTIVE',
    "href" TEXT,
    "metadata" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSphereOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSphereSavedItem" (
    "userId" TEXT NOT NULL,
    "opportunityId" UUID NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgriSphereSavedItem_pkey" PRIMARY KEY ("userId","opportunityId")
);

-- CreateTable
CREATE TABLE "AgriSpherePersonaCluster" (
    "clusterId" INTEGER NOT NULL,
    "centroidVector" JSONB NOT NULL,
    "lastRefreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSpherePersonaCluster_pkey" PRIMARY KEY ("clusterId")
);

-- CreateTable
CREATE TABLE "AgriSphereOrganization" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "countryCode" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "href" TEXT,
    "metadata" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSphereOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSphereTreaty" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "href" TEXT,
    "metadata" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSphereTreaty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSphereTreatyCountry" (
    "treatyId" UUID NOT NULL,
    "countryCode" TEXT NOT NULL,

    CONSTRAINT "AgriSphereTreatyCountry_pkey" PRIMARY KEY ("treatyId","countryCode")
);

-- CreateTable
CREATE TABLE "AgriSphereSector" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "href" TEXT,
    "metadata" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSphereSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSphereProducer" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT,
    "sectorId" UUID,
    "isTopProducer" BOOLEAN NOT NULL DEFAULT false,
    "producerRank" INTEGER,
    "commodities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "signal" TEXT,
    "activityLevel" "AgriSphereActivityLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSphereProducer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSphereEvent" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "format" "AgriSphereEventFormat" NOT NULL,
    "url" TEXT,
    "countryCode" TEXT,
    "metadata" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSphereEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSpherePartner" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "tier" "AgriSpherePartnerTier" NOT NULL,
    "url" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriSpherePartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSpherePlatformStatsSnapshot" (
    "id" BIGSERIAL NOT NULL,
    "countryCount" INTEGER NOT NULL,
    "farmerCount" INTEGER NOT NULL,
    "partnerCount" INTEGER NOT NULL,
    "activeProjectCount" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgriSpherePlatformStatsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriSphereMapPinClusterReading" (
    "id" BIGSERIAL NOT NULL,
    "clusterId" TEXT NOT NULL,
    "rawCount" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgriSphereMapPinClusterReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereContinent_code_key" ON "AgriSphereContinent"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereCountry_code_key" ON "AgriSphereCountry"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereCountry_slug_key" ON "AgriSphereCountry"("slug");

-- CreateIndex
CREATE INDEX "AgriSphereCountry_continentCode_idx" ON "AgriSphereCountry"("continentCode");

-- CreateIndex
CREATE INDEX "AgriSphereCountry_activityLevel_idx" ON "AgriSphereCountry"("activityLevel");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereOpportunity_slug_key" ON "AgriSphereOpportunity"("slug");

-- CreateIndex
CREATE INDEX "AgriSphereOpportunity_countryCode_idx" ON "AgriSphereOpportunity"("countryCode");

-- CreateIndex
CREATE INDEX "AgriSphereOpportunity_createdById_idx" ON "AgriSphereOpportunity"("createdById");

-- CreateIndex
CREATE INDEX "AgriSphereOpportunity_status_countryCode_createdAt_idx" ON "AgriSphereOpportunity"("status", "countryCode", "createdAt");

-- CreateIndex
CREATE INDEX "AgriSphereSavedItem_opportunityId_idx" ON "AgriSphereSavedItem"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereOrganization_slug_key" ON "AgriSphereOrganization"("slug");

-- CreateIndex
CREATE INDEX "AgriSphereOrganization_countryCode_idx" ON "AgriSphereOrganization"("countryCode");

-- CreateIndex
CREATE INDEX "AgriSphereOrganization_type_idx" ON "AgriSphereOrganization"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereTreaty_slug_key" ON "AgriSphereTreaty"("slug");

-- CreateIndex
CREATE INDEX "AgriSphereTreatyCountry_countryCode_idx" ON "AgriSphereTreatyCountry"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereSector_slug_key" ON "AgriSphereSector"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereProducer_slug_key" ON "AgriSphereProducer"("slug");

-- CreateIndex
CREATE INDEX "AgriSphereProducer_countryCode_idx" ON "AgriSphereProducer"("countryCode");

-- CreateIndex
CREATE INDEX "AgriSphereProducer_sectorId_idx" ON "AgriSphereProducer"("sectorId");

-- CreateIndex
CREATE INDEX "AgriSphereProducer_isTopProducer_producerRank_idx" ON "AgriSphereProducer"("isTopProducer", "producerRank");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereEvent_slug_key" ON "AgriSphereEvent"("slug");

-- CreateIndex
CREATE INDEX "AgriSphereEvent_countryCode_idx" ON "AgriSphereEvent"("countryCode");

-- CreateIndex
CREATE INDEX "AgriSphereEvent_startsAt_idx" ON "AgriSphereEvent"("startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgriSpherePartner_slug_key" ON "AgriSpherePartner"("slug");

-- CreateIndex
CREATE INDEX "AgriSpherePartner_tier_sortOrder_idx" ON "AgriSpherePartner"("tier", "sortOrder");

-- CreateIndex
CREATE INDEX "AgriSpherePlatformStatsSnapshot_recordedAt_idx" ON "AgriSpherePlatformStatsSnapshot"("recordedAt");

-- CreateIndex
CREATE INDEX "AgriSphereMapPinClusterReading_clusterId_recordedAt_idx" ON "AgriSphereMapPinClusterReading"("clusterId", "recordedAt");

-- AddForeignKey
ALTER TABLE "AgriSphereCountry" ADD CONSTRAINT "AgriSphereCountry_continentCode_fkey" FOREIGN KEY ("continentCode") REFERENCES "AgriSphereContinent"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereOpportunity" ADD CONSTRAINT "AgriSphereOpportunity_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "AgriSphereCountry"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereOpportunity" ADD CONSTRAINT "AgriSphereOpportunity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereSavedItem" ADD CONSTRAINT "AgriSphereSavedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereSavedItem" ADD CONSTRAINT "AgriSphereSavedItem_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "AgriSphereOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereOrganization" ADD CONSTRAINT "AgriSphereOrganization_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "AgriSphereCountry"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereTreatyCountry" ADD CONSTRAINT "AgriSphereTreatyCountry_treatyId_fkey" FOREIGN KEY ("treatyId") REFERENCES "AgriSphereTreaty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereTreatyCountry" ADD CONSTRAINT "AgriSphereTreatyCountry_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "AgriSphereCountry"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereProducer" ADD CONSTRAINT "AgriSphereProducer_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "AgriSphereCountry"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereProducer" ADD CONSTRAINT "AgriSphereProducer_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "AgriSphereSector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriSphereEvent" ADD CONSTRAINT "AgriSphereEvent_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "AgriSphereCountry"("code") ON DELETE SET NULL ON UPDATE CASCADE;
