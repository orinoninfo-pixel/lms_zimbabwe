-- Live lessons can now attach to a Course, not just a SubjectPackage.
ALTER TABLE "LiveLesson" ADD COLUMN "courseId" UUID;
ALTER TABLE "LiveLesson" ALTER COLUMN "grade" DROP NOT NULL;

ALTER TABLE "LiveLesson" ADD CONSTRAINT "LiveLesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
