-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'OPENED', 'REGISTERED', 'EXPIRED', 'INVALIDATED');

-- CreateEnum
CREATE TYPE "AcquisitionSource" AS ENUM ('ORGANIC', 'INVITATION');

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "normalizedEmail" TEXT,
    "phone" TEXT,
    "normalizedPhone" TEXT,
    "country" TEXT,
    "suggestedRole" TEXT,
    "invitedBy" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'copy_link',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "openedAt" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3),
    "registeredUserId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAcquisition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "AcquisitionSource" NOT NULL DEFAULT 'ORGANIC',
    "invitationId" TEXT,
    "invitedBy" TEXT,
    "inviteChannel" TEXT,
    "selfReportedSource" TEXT,
    "selfReportedDetail" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "utmMedium" TEXT,
    "firstTouchUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAcquisition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_code_key" ON "Invitation"("code");

-- CreateIndex
CREATE INDEX "Invitation_normalizedEmail_status_idx" ON "Invitation"("normalizedEmail", "status");

-- CreateIndex
CREATE INDEX "Invitation_normalizedPhone_status_idx" ON "Invitation"("normalizedPhone", "status");

-- CreateIndex
CREATE INDEX "Invitation_expiresAt_idx" ON "Invitation"("expiresAt");

-- CreateIndex
CREATE INDEX "Invitation_registeredUserId_idx" ON "Invitation"("registeredUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAcquisition_userId_key" ON "UserAcquisition"("userId");

-- CreateIndex
CREATE INDEX "UserAcquisition_source_idx" ON "UserAcquisition"("source");

-- CreateIndex
CREATE INDEX "UserAcquisition_invitationId_idx" ON "UserAcquisition"("invitationId");

-- CreateIndex
CREATE INDEX "UserAcquisition_inviteChannel_idx" ON "UserAcquisition"("inviteChannel");

-- CreateIndex
CREATE INDEX "UserAcquisition_utmSource_utmCampaign_idx" ON "UserAcquisition"("utmSource", "utmCampaign");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_registeredUserId_fkey" FOREIGN KEY ("registeredUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAcquisition" ADD CONSTRAINT "UserAcquisition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAcquisition" ADD CONSTRAINT "UserAcquisition_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
