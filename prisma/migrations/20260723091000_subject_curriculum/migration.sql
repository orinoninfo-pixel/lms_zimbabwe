-- Optional sections/lessons/progress for SubjectPackage, mirroring Course/Section/Lesson/Progress.
CREATE TABLE "SubjectSection" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subjectPackageId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubjectSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubjectLesson" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "sectionId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubjectLesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubjectLessonProgress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectLessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubjectLessonProgress_userId_lessonId_key" ON "SubjectLessonProgress"("userId", "lessonId");

ALTER TABLE "SubjectSection" ADD CONSTRAINT "SubjectSection_subjectPackageId_fkey" FOREIGN KEY ("subjectPackageId") REFERENCES "SubjectPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectLesson" ADD CONSTRAINT "SubjectLesson_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SubjectSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectLessonProgress" ADD CONSTRAINT "SubjectLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectLessonProgress" ADD CONSTRAINT "SubjectLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "SubjectLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
