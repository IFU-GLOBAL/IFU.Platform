-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DashboardItemType" AS ENUM ('OPPORTUNITY', 'TRAINING', 'FUNDING', 'MARKETPLACE', 'EXPERT', 'COMMUNITY', 'MAP_COUNTRY', 'DOCUMENT', 'MESSAGE', 'APPLICATION', 'ECOSYSTEM', 'RESOURCE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "RoleCategory" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "description" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "level" TEXT;

UPDATE "Role" SET "level" = "pathway" WHERE "level" IS NULL;
UPDATE "Role" SET "description" = "summary" WHERE "description" IS NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "cognitoId" TEXT,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "accessStatus" "AccessStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryRoleId" TEXT,
    "primaryCategoryId" TEXT,
    "country" TEXT,
    "stateProvince" TEXT,
    "city" TEXT,
    "region" TEXT,
    "timezone" TEXT,
    "localTimeLabel" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "organization" TEXT,
    "phone" TEXT,
    "profileCompletion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSelectedRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSelectedRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviewApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "organization" TEXT,
    "message" TEXT,
    "howHeard" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "motivation" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "expectedShareCount" TEXT,
    "referralUrl" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "utmMedium" TEXT,
    "cityDetected" TEXT,
    "countryDetected" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreviewApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviewApplicationRole" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "PreviewApplicationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendedContact" (
    "id" TEXT NOT NULL,
    "previewSubmissionId" TEXT,
    "previewApplicationId" TEXT,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "email" TEXT,
    "relationship" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendedContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralSource" (
    "id" TEXT NOT NULL,
    "previewSubmissionId" TEXT,
    "previewApplicationId" TEXT,
    "source" TEXT NOT NULL,
    "detail" TEXT,
    "referrerUrl" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "utmMedium" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DashboardItemType" NOT NULL,
    "category" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "country" TEXT,
    "roleTargets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "actionLabel" TEXT,
    "imageUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dashboardItemId" TEXT,
    "title" TEXT NOT NULL,
    "itemType" "DashboardItemType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dashboardItemId" TEXT,
    "title" TEXT NOT NULL,
    "itemType" "DashboardItemType" NOT NULL,
    "notes" TEXT,
    "reminderDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "step" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT,
    "s3Key" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "previewSubmissionId" TEXT,
    "previewApplicationId" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "source" TEXT,
    "consentStatus" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoId_key" ON "User"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_primaryRoleId_idx" ON "UserProfile"("primaryRoleId");

-- CreateIndex
CREATE INDEX "UserProfile_primaryCategoryId_idx" ON "UserProfile"("primaryCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSelectedRole_userId_roleId_key" ON "UserSelectedRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "UserSelectedRole_roleId_idx" ON "UserSelectedRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "PreviewApplicationRole_applicationId_roleId_key" ON "PreviewApplicationRole"("applicationId", "roleId");

-- CreateIndex
CREATE INDEX "PreviewApplicationRole_roleId_idx" ON "PreviewApplicationRole"("roleId");

-- CreateIndex
CREATE INDEX "RecommendedContact_previewSubmissionId_idx" ON "RecommendedContact"("previewSubmissionId");

-- CreateIndex
CREATE INDEX "RecommendedContact_previewApplicationId_idx" ON "RecommendedContact"("previewApplicationId");

-- CreateIndex
CREATE INDEX "ReferralSource_previewSubmissionId_idx" ON "ReferralSource"("previewSubmissionId");

-- CreateIndex
CREATE INDEX "ReferralSource_previewApplicationId_idx" ON "ReferralSource"("previewApplicationId");

-- CreateIndex
CREATE INDEX "WorkspaceItem_userId_idx" ON "WorkspaceItem"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceItem_dashboardItemId_idx" ON "WorkspaceItem"("dashboardItemId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_dashboardItemId_idx" ON "Bookmark"("dashboardItemId");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "GeoEvent_userId_idx" ON "GeoEvent"("userId");

-- CreateIndex
CREATE INDEX "GeoEvent_previewSubmissionId_idx" ON "GeoEvent"("previewSubmissionId");

-- CreateIndex
CREATE INDEX "GeoEvent_previewApplicationId_idx" ON "GeoEvent"("previewApplicationId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSelectedRole" ADD CONSTRAINT "UserSelectedRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSelectedRole" ADD CONSTRAINT "UserSelectedRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviewApplicationRole" ADD CONSTRAINT "PreviewApplicationRole_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "PreviewApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviewApplicationRole" ADD CONSTRAINT "PreviewApplicationRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendedContact" ADD CONSTRAINT "RecommendedContact_previewSubmissionId_fkey" FOREIGN KEY ("previewSubmissionId") REFERENCES "PreviewSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendedContact" ADD CONSTRAINT "RecommendedContact_previewApplicationId_fkey" FOREIGN KEY ("previewApplicationId") REFERENCES "PreviewApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralSource" ADD CONSTRAINT "ReferralSource_previewSubmissionId_fkey" FOREIGN KEY ("previewSubmissionId") REFERENCES "PreviewSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralSource" ADD CONSTRAINT "ReferralSource_previewApplicationId_fkey" FOREIGN KEY ("previewApplicationId") REFERENCES "PreviewApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceItem" ADD CONSTRAINT "WorkspaceItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceItem" ADD CONSTRAINT "WorkspaceItem_dashboardItemId_fkey" FOREIGN KEY ("dashboardItemId") REFERENCES "DashboardItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_dashboardItemId_fkey" FOREIGN KEY ("dashboardItemId") REFERENCES "DashboardItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoEvent" ADD CONSTRAINT "GeoEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoEvent" ADD CONSTRAINT "GeoEvent_previewSubmissionId_fkey" FOREIGN KEY ("previewSubmissionId") REFERENCES "PreviewSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoEvent" ADD CONSTRAINT "GeoEvent_previewApplicationId_fkey" FOREIGN KEY ("previewApplicationId") REFERENCES "PreviewApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
