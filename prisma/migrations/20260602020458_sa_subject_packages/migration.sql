-- CreateEnum
CREATE TYPE "SubjectEnrollmentStatus" AS ENUM ('pending', 'active', 'expired', 'cancelled');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "subjectPackageId" UUID;

-- AlterTable
ALTER TABLE "ExamResource" ADD COLUMN     "subjectPackageId" UUID;

-- AlterTable
ALTER TABLE "HomeworkAssignment" ADD COLUMN     "subjectPackageId" UUID;

-- AlterTable
ALTER TABLE "LearningResource" ADD COLUMN     "subjectPackageId" UUID;

-- AlterTable
ALTER TABLE "LiveLesson" ADD COLUMN     "subjectPackageId" UUID;

-- CreateTable
CREATE TABLE "SubjectPackage" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "term" INTEGER,
    "price" INTEGER NOT NULL,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'ZAR',
    "isCapsAligned" BOOLEAN NOT NULL DEFAULT true,
    "includesLiveLessons" BOOLEAN NOT NULL DEFAULT true,
    "isExamPrep" BOOLEAN NOT NULL DEFAULT false,
    "isHolidayLearning" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" UUID,
    "categoryId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectEnrollment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "subjectPackageId" UUID NOT NULL,
    "status" "SubjectEnrollmentStatus" NOT NULL DEFAULT 'pending',
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubjectPackage_grade_subject_idx" ON "SubjectPackage"("grade", "subject");

-- CreateIndex
CREATE INDEX "SubjectPackage_term_idx" ON "SubjectPackage"("term");

-- CreateIndex
CREATE INDEX "SubjectEnrollment_status_idx" ON "SubjectEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectEnrollment_userId_subjectPackageId_key" ON "SubjectEnrollment"("userId", "subjectPackageId");

-- AddForeignKey
ALTER TABLE "LiveLesson" ADD CONSTRAINT "LiveLesson_subjectPackageId_fkey" FOREIGN KEY ("subjectPackageId") REFERENCES "SubjectPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAssignment" ADD CONSTRAINT "HomeworkAssignment_subjectPackageId_fkey" FOREIGN KEY ("subjectPackageId") REFERENCES "SubjectPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResource" ADD CONSTRAINT "ExamResource_subjectPackageId_fkey" FOREIGN KEY ("subjectPackageId") REFERENCES "SubjectPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_subjectPackageId_fkey" FOREIGN KEY ("subjectPackageId") REFERENCES "SubjectPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_subjectPackageId_fkey" FOREIGN KEY ("subjectPackageId") REFERENCES "SubjectPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectPackage" ADD CONSTRAINT "SubjectPackage_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectPackage" ADD CONSTRAINT "SubjectPackage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectEnrollment" ADD CONSTRAINT "SubjectEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectEnrollment" ADD CONSTRAINT "SubjectEnrollment_subjectPackageId_fkey" FOREIGN KEY ("subjectPackageId") REFERENCES "SubjectPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
