-- CreateTable
CREATE TABLE "RoleCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "pathway" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviewSubmission" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "organization" TEXT,
    "roleOrTitle" TEXT,
    "selectedRoleSlugs" TEXT[],
    "leadershipInterest" TEXT,
    "contributionInterests" TEXT[],
    "referralSource" TEXT,
    "referralDetail" TEXT,
    "recommendedContactName" TEXT,
    "recommendedContactEmail" TEXT,
    "recommendedContactRelationship" TEXT,
    "message" TEXT,
    "emailStatus" TEXT NOT NULL DEFAULT 'pending',
    "emailMessageId" TEXT,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreviewSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviewSubmissionRole" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "PreviewSubmissionRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleCategory_slug_key" ON "RoleCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "Role_categoryId_idx" ON "Role"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PreviewSubmissionRole_submissionId_roleId_key" ON "PreviewSubmissionRole"("submissionId", "roleId");

-- CreateIndex
CREATE INDEX "PreviewSubmissionRole_roleId_idx" ON "PreviewSubmissionRole"("roleId");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RoleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviewSubmissionRole" ADD CONSTRAINT "PreviewSubmissionRole_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "PreviewSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviewSubmissionRole" ADD CONSTRAINT "PreviewSubmissionRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
