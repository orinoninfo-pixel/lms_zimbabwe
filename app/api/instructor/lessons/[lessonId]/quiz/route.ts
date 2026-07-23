import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const QuestionInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("multiple_choice"),
    prompt: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).min(2).max(6),
    correctOption: z.number().int().min(0),
  }),
  z.object({
    type: z.literal("short_answer"),
    prompt: z.string().trim().min(1),
  }),
])

const PutQuizSchema = z.object({
  title: z.string().trim().min(1),
  questions: z.array(QuestionInputSchema).min(1),
})

async function requireInstructor() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== "instructor") return null

  const instructor = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } })
  if (!instructor || instructor.role !== "instructor") return null
  return instructor
}

async function findOwnedLesson(lessonId: string, teacherId: string) {
  const lesson = await prisma.subjectLesson.findUnique({
    where: { id: lessonId },
    select: { id: true, section: { select: { subjectPackage: { select: { teacherId: true } } } } },
  })
  if (!lesson || lesson.section.subjectPackage.teacherId !== teacherId) return null
  return lesson
}

export async function GET(_: Request, context: { params: Promise<{ lessonId: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { lessonId } = await context.params
  const lesson = await findOwnedLesson(lessonId, instructor.id)
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 })

  const quiz = await prisma.subjectQuiz.findUnique({
    where: { lessonId },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { attempts: true } },
    },
  })

  return Response.json({ quiz })
}

export async function PUT(req: Request, context: { params: Promise<{ lessonId: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { lessonId } = await context.params
  const lesson = await findOwnedLesson(lessonId, instructor.id)
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 })

  const json = await req.json().catch(() => null)
  const parsed = PutQuizSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  for (const q of parsed.data.questions) {
    if (q.type === "multiple_choice" && q.correctOption >= q.options.length) {
      return Response.json({ error: "correctOption must reference a valid option index" }, { status: 400 })
    }
  }

  const quiz = await prisma.$transaction(async (tx) => {
    const existing = await tx.subjectQuiz.findUnique({ where: { lessonId }, select: { id: true } })

    const quizRecord = existing
      ? await tx.subjectQuiz.update({ where: { id: existing.id }, data: { title: parsed.data.title } })
      : await tx.subjectQuiz.create({ data: { lessonId, title: parsed.data.title } })

    await tx.subjectQuizAnswer.deleteMany({ where: { question: { quizId: quizRecord.id } } })
    await tx.subjectQuizAttempt.deleteMany({ where: { quizId: quizRecord.id } })
    await tx.subjectQuizQuestion.deleteMany({ where: { quizId: quizRecord.id } })

    for (const [index, q] of parsed.data.questions.entries()) {
      await tx.subjectQuizQuestion.create({
        data: {
          quizId: quizRecord.id,
          type: q.type,
          prompt: q.prompt,
          order: index,
          options: q.type === "multiple_choice" ? q.options : undefined,
          correctOption: q.type === "multiple_choice" ? q.correctOption : null,
        },
      })
    }

    return tx.subjectQuiz.findUnique({
      where: { id: quizRecord.id },
      include: { questions: { orderBy: { order: "asc" } } },
    })
  })

  return Response.json({ success: true, quiz })
}

export async function DELETE(_: Request, context: { params: Promise<{ lessonId: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { lessonId } = await context.params
  const lesson = await findOwnedLesson(lessonId, instructor.id)
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 })

  const quiz = await prisma.subjectQuiz.findUnique({ where: { lessonId }, select: { id: true } })
  if (!quiz) return Response.json({ success: true })

  await prisma.subjectQuizAnswer.deleteMany({ where: { question: { quizId: quiz.id } } })
  await prisma.subjectQuizAttempt.deleteMany({ where: { quizId: quiz.id } })
  await prisma.subjectQuizQuestion.deleteMany({ where: { quizId: quiz.id } })
  await prisma.subjectQuiz.delete({ where: { id: quiz.id } })

  return Response.json({ success: true })
}
