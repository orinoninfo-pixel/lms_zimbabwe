/*
  Warnings:

  - You are about to drop the column `activatedAt` on the `SubjectEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `SubjectEnrollment` table. All the data in the column will be lost.
  - Added the required column `grade` to the `SubjectEnrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `SubjectEnrollment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('monthly');

-- AlterTable
ALTER TABLE "SubjectEnrollment"
ADD COLUMN     "billingPeriod" "BillingPeriod" NOT NULL DEFAULT 'monthly',
ADD COLUMN     "currency" "CurrencyCode" NOT NULL DEFAULT 'ZAR',
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "grade" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- Backfill new fields from the linked package and preserve previous dates.
UPDATE "SubjectEnrollment" se
SET
  "grade" = sp."grade",
  "price" = sp."price",
  "startDate" = COALESCE(se."activatedAt", se."createdAt"),
  "endDate" = se."expiresAt"
FROM "SubjectPackage" sp
WHERE se."subjectPackageId" = sp."id";

-- Ensure monthly subscriptions have an end date for active enrollments.
UPDATE "SubjectEnrollment"
SET "endDate" = ("startDate" + INTERVAL '1 month')
WHERE "status" = 'active' AND "startDate" IS NOT NULL AND "endDate" IS NULL;

-- Drop defaults now that existing rows are backfilled.
ALTER TABLE "SubjectEnrollment" ALTER COLUMN "grade" DROP DEFAULT;
ALTER TABLE "SubjectEnrollment" ALTER COLUMN "price" DROP DEFAULT;

-- Remove legacy columns.
ALTER TABLE "SubjectEnrollment" DROP COLUMN "activatedAt", DROP COLUMN "expiresAt";

-- AlterTable
ALTER TABLE "SubjectPackage" ADD COLUMN     "billingPeriod" "BillingPeriod" NOT NULL DEFAULT 'monthly';
