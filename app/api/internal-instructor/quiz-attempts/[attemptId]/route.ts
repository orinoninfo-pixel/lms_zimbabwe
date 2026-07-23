import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

const GradeAttemptSchema = z.object({
  answers: z.array(
    z.object({
      answerId: z.string().uuid(),
      isCorrect: z.boolean().nullable().optional(),
      reviewerFeedback: z.string().trim().min(1).nullable().optional(),
    })
  ),
})

export async function PATCH(req: Request, context: { params: Promise<{ attemptId: string }> }) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const { attemptId } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = GradeAttemptSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const attempt = await prisma.subjectQuizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      quiz: { select: { lesson: { select: { section: { select: { subjectPackage: { select: { teacherId: true } } } } } } } },
    },
  })
  if (!attempt || attempt.quiz.lesson.section.subjectPackage.teacherId !== auth.user.id) {
    return Response.json({ error: "Attempt not found" }, { status: 404 })
  }

  await prisma.$transaction(
    parsed.data.answers.map((a) =>
      prisma.subjectQuizAnswer.update({
        where: { id: a.answerId },
        data: {
          ...(a.isCorrect !== undefined ? { isCorrect: a.isCorrect } : {}),
          ...(a.reviewerFeedback !== undefined ? { reviewerFeedback: a.reviewerFeedback } : {}),
        },
      })
    )
  )

  const updated = await prisma.subjectQuizAttempt.update({
    where: { id: attemptId },
    data: { gradedAt: new Date() },
    include: { answers: true },
  })

  const score = updated.answers.filter((a) => a.isCorrect === true).length
  await prisma.subjectQuizAttempt.update({ where: { id: attemptId }, data: { score } })

  return Response.json({ success: true })
}
