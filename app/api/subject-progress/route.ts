import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const ProgressBodySchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean().optional(),
})

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }
  if (session.role !== "student") {
    return Response.json({ error: "Only students can update progress" }, { status: 403 })
  }

  const json = await req.json().catch(() => null)
  const parsed = ProgressBodySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const lessonId = parsed.data.lessonId
  const completed = parsed.data.completed ?? true

  try {
    const userId = session.userId

    const lesson = await prisma.subjectLesson.findUnique({
      where: { id: lessonId },
      select: { id: true, section: { select: { subjectPackageId: true } } },
    })

    if (!lesson) {
      return Response.json({ error: "Lesson not found" }, { status: 404 })
    }

    const subjectPackageId = lesson.section.subjectPackageId
    const enrollment = await prisma.subjectEnrollment.findUnique({
      where: { userId_subjectPackageId: { userId, subjectPackageId } },
      select: { id: true, status: true },
    })
    if (!enrollment || enrollment.status !== "active") {
      return Response.json({ error: "An active subscription is required before tracking progress" }, { status: 403 })
    }

    const progressEntry = await prisma.subjectLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed, completedAt: completed ? new Date() : null },
      create: { userId, lessonId, completed, completedAt: completed ? new Date() : null },
    })

    const totalLessons = await prisma.subjectLesson.count({
      where: { section: { subjectPackageId } },
    })
    const completedLessons = await prisma.subjectLessonProgress.count({
      where: { userId, completed: true, lesson: { section: { subjectPackageId } } },
    })
    const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)
    const subjectProgress = { userId, subjectPackageId, totalLessons, completedLessons, percent }

    return Response.json({ success: true, progressEntry, subjectProgress })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update progress"
    return Response.json({ error: message }, { status: 500 })
  }
}
