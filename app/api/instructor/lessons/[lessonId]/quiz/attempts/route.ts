import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

async function requireInstructor() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== "instructor") return null

  const instructor = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } })
  if (!instructor || instructor.role !== "instructor") return null
  return instructor
}

export async function GET(_: Request, context: { params: Promise<{ lessonId: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { lessonId } = await context.params

  const lesson = await prisma.subjectLesson.findUnique({
    where: { id: lessonId },
    select: { id: true, section: { select: { subjectPackage: { select: { teacherId: true } } } } },
  })
  if (!lesson || lesson.section.subjectPackage.teacherId !== instructor.id) {
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
