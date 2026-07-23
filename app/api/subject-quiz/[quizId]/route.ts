import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

async function requireActiveEnrollment(quizId: string, userId: string) {
  const quiz = await prisma.subjectQuiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      lesson: { select: { id: true, section: { select: { subjectPackageId: true } } } },
      questions: { orderBy: { order: "asc" } },
    },
  })
  if (!quiz) return { quiz: null, allowed: false }

  const enrollment = await prisma.subjectEnrollment.findUnique({
    where: {
      userId_subjectPackageId: { userId, subjectPackageId: quiz.lesson.section.subjectPackageId },
    },
    select: { status: true },
  })
  const allowed = enrollment?.status === "active"
  return { quiz, allowed }
}

export async function GET(_: Request, context: { params: Promise<{ quizId: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "student") return Response.json({ error: "Forbidden" }, { status: 403 })

  const { quizId } = await context.params
  const { quiz, allowed } = await requireActiveEnrollment(quizId, session.userId)
  if (!quiz) return Response.json({ error: "Quiz not found" }, { status: 404 })
  if (!allowed) return Response.json({ error: "An active subscription is required to take this quiz" }, { status: 403 })

  const attempt = await prisma.subjectQuizAttempt.findUnique({
    where: { quizId_studentId: { quizId, studentId: session.userId } },
    include: { answers: true },
  })

  return Response.json({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        order: q.order,
        options: q.options,
      })),
    },
    attempt: attempt
      ? {
          id: attempt.id,
          score: attempt.score,
          submittedAt: attempt.submittedAt,
          gradedAt: attempt.gradedAt,
          answers: attempt.answers.map((a) => ({
            questionId: a.questionId,
            selectedOption: a.selectedOption,
            textAnswer: a.textAnswer,
            isCorrect: a.isCorrect,
            reviewerFeedback: a.reviewerFeedback,
          })),
        }
      : null,
  })
}

const SubmitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedOption: z.number().int().min(0).optional(),
      textAnswer: z.string().trim().min(1).optional(),
    })
  ),
})

export async function POST(req: Request, context: { params: Promise<{ quizId: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "student") return Response.json({ error: "Forbidden" }, { status: 403 })

  const { quizId } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = SubmitAttemptSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { quiz, allowed } = await requireActiveEnrollment(quizId, session.userId)
  if (!quiz) return Response.json({ error: "Quiz not found" }, { status: 404 })
  if (!allowed) return Response.json({ error: "An active subscription is required to take this quiz" }, { status: 403 })

  const questionById = new Map(quiz.questions.map((q) => [q.id, q]))
  const hasShortAnswer = quiz.questions.some((q) => q.type === "short_answer")

  const result = await prisma.$transaction(async (tx) => {
    const attempt = await tx.subjectQuizAttempt.upsert({
      where: { quizId_studentId: { quizId, studentId: session.userId } },
      update: { submittedAt: new Date(), gradedAt: null, score: null },
      create: { quizId, studentId: session.userId, submittedAt: new Date() },
    })

    await tx.subjectQuizAnswer.deleteMany({ where: { attemptId: attempt.id } })

    let correctCount = 0
    for (const answer of parsed.data.answers) {
      const question = questionById.get(answer.questionId)
      if (!question) continue

      const isCorrect =
        question.type === "multiple_choice"
          ? answer.selectedOption !== undefined && answer.selectedOption === question.correctOption
          : null
      if (isCorrect) correctCount += 1

      await tx.subjectQuizAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: answer.questionId,
          selectedOption: answer.selectedOption ?? null,
          textAnswer: answer.textAnswer ?? null,
          isCorrect,
        },
      })
    }

    return tx.subjectQuizAttempt.update({
      where: { id: attempt.id },
      data: {
        score: correctCount,
        gradedAt: hasShortAnswer ? null : new Date(),
      },
      include: { answers: true },
    })
  })

  return Response.json({ success: true, attempt: result, pendingReview: hasShortAnswer })
}
