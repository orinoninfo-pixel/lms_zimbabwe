import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

export async function GET(_: Request, context: { params: Promise<{ lessonId: string }> }) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const { lessonId } = await context.params

  const lesson = await prisma.subjectLesson.findUnique({
    where: { id: lessonId },
    select: { id: true, section: { select: { subjectPackage: { select: { teacherId: true } } } } },
  })
  if (!lesson || lesson.section.subjectPackage.teacherId !== auth.user.id) {
    return Response.json({ error: "Lesson not found" }, { status: 404 })
  }

  const quiz = await prisma.subjectQuiz.findUnique({ where: { lessonId }, select: { id: true } })
  if (!quiz) return Response.json({ attempts: [] })

  const attempts = await prisma.subjectQuizAttempt.findMany({
    where: { quizId: quiz.id },
    include: {
      student: { select: { id: true, name: true, email: true } },
      answers: { include: { question: true }, orderBy: { question: { order: "asc" } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return Response.json({ attempts })
}
