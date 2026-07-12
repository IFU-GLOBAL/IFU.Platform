ALTER TABLE "User"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "preferredDisplayName" TEXT;

ALTER TABLE "UserProfile"
ADD COLUMN "preferredLanguage" TEXT;
