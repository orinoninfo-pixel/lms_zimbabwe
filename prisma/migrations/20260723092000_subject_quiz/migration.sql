-- Lesson-attached quizzes for subject curriculum lessons (multiple-choice + short-answer).
CREATE TYPE "SubjectQuizQuestionType" AS ENUM ('multiple_choice', 'short_answer');

CREATE TABLE "SubjectQuiz" (
    "id" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectQuiz_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubjectQuiz_lessonId_key" ON "SubjectQuiz"("lessonId");

CREATE TABLE "SubjectQuizQuestion" (
    "id" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "type" "SubjectQuizQuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "correctOption" INTEGER,

    CONSTRAINT "SubjectQuizQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubjectQuizAttempt" (
    "id" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "score" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectQuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubjectQuizAttempt_quizId_studentId_key" ON "SubjectQuizAttempt"("quizId", "studentId");

CREATE TABLE "SubjectQuizAnswer" (
    "id" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "selectedOption" INTEGER,
    "textAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "reviewerFeedback" TEXT,

    CONSTRAINT "SubjectQuizAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubjectQuizAnswer_attemptId_questionId_key" ON "SubjectQuizAnswer"("attemptId", "questionId");

ALTER TABLE "SubjectQuiz" ADD CONSTRAINT "SubjectQuiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "SubjectLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectQuizQuestion" ADD CONSTRAINT "SubjectQuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "SubjectQuiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectQuizAttempt" ADD CONSTRAINT "SubjectQuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "SubjectQuiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectQuizAttempt" ADD CONSTRAINT "SubjectQuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectQuizAnswer" ADD CONSTRAINT "SubjectQuizAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "SubjectQuizAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubjectQuizAnswer" ADD CONSTRAINT "SubjectQuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SubjectQuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
