-- CreateEnum
CREATE TYPE "AgriSphereSecuritySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AgriSphereSecurityReviewState" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'DISMISSED', 'ESCALATED');

-- CreateTable
CREATE TABLE "AgriSphereSecurityEvent" (
    "id" UUID NOT NULL,
    "correlationId" TEXT NOT NULL,
    "actorHash" TEXT NOT NULL,
    "requestFingerprint" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "countryCode" TEXT,
    "requestPattern" JSONB NOT NULL,
    "featureVector" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL,
    "severity" "AgriSphereSecuritySeverity" NOT NULL,
    "triggers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "reviewState" "AgriSphereSecurityReviewState" NOT NULL DEFAULT 'PENDING',
    "surfacedToAdmin" BOOLEAN NOT NULL DEFAULT true,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgriSphereSecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgriSphereSecurityEvent_correlationId_key" ON "AgriSphereSecurityEvent"("correlationId");

-- CreateIndex
CREATE INDEX "AgriSphereSecurityEvent_occurredAt_idx" ON "AgriSphereSecurityEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "AgriSphereSecurityEvent_expiresAt_idx" ON "AgriSphereSecurityEvent"("expiresAt");

-- CreateIndex
CREATE INDEX "AgriSphereSecurityEvent_eventType_severity_occurredAt_idx" ON "AgriSphereSecurityEvent"("eventType", "severity", "occurredAt");

-- CreateIndex
CREATE INDEX "AgriSphereSecurityEvent_actorHash_occurredAt_idx" ON "AgriSphereSecurityEvent"("actorHash", "occurredAt");

-- CreateIndex
CREATE INDEX "AgriSphereSecurityEvent_reviewState_surfacedToAdmin_occurredAt_idx" ON "AgriSphereSecurityEvent"("reviewState", "surfacedToAdmin", "occurredAt");
