ALTER TABLE "PreviewSubmission"
ADD COLUMN "privacyConsentAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "privacyConsentAcceptedAt" TIMESTAMP(3),
ADD COLUMN "referralConsentAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "referralConsentAcceptedAt" TIMESTAMP(3);

ALTER TABLE "RecommendedContact"
ADD COLUMN "consentConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "consentConfirmedAt" TIMESTAMP(3),
ADD COLUMN "oneTimeInviteStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "oneTimeInviteMessageId" TEXT,
ADD COLUMN "oneTimeInviteError" TEXT,
ADD COLUMN "oneTimeInviteSentAt" TIMESTAMP(3),
ADD COLUMN "deleteAfter" TIMESTAMP(3);
