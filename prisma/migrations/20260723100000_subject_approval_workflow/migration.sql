-- Subjects now require admin approval before being visible to students, mirroring Course moderation.
-- The DB default of 'approved' backfills every existing row so already-published subjects
-- (and any student subscriptions to them) are unaffected; the application explicitly sets
-- status: "draft" on every new subject going forward, bypassing this default.
CREATE TYPE "SubjectPackageStatus" AS ENUM ('draft', 'pending', 'approved', 'rejected', 'suspended');

ALTER TABLE "SubjectPackage" ADD COLUMN "status" "SubjectPackageStatus" NOT NULL DEFAULT 'approved';
ALTER TABLE "SubjectPackage" ADD COLUMN "moderationNote" TEXT;
