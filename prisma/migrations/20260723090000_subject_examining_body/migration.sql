-- Zimbabwe grade/form levels reuse the existing SubjectPackage.grade Int column
-- (1-7 = Grade 1-7, 8-13 = Form 1-6); app-layer validators widen 1-12 to 1-13.
-- This migration only adds the examining body, which previously had no field.
CREATE TYPE "ExaminingBody" AS ENUM ('zimsec', 'cambridge');

ALTER TABLE "SubjectPackage" ADD COLUMN "examiningBody" "ExaminingBody" NOT NULL DEFAULT 'zimsec';
