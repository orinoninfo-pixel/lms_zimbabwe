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

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, section: { select: { courseId: true } } },
    })

    if (!lesson) {
      return Response.json({ error: "Lesson not found" }, { status: 404 })
    }

    const courseId = lesson.section.courseId
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    })
    if (!enrollment) {
      return Response.json({ error: "Course payment is required before tracking progress" }, { status: 403 })
    }

    const progressEntry = await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed },
      create: { userId, lessonId, completed },
    })

    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    })
    const completedLessons = await prisma.progress.count({
      where: { userId, completed: true, lesson: { section: { courseId } } },
    })
    const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)
    const courseProgress = { userId, courseId, totalLessons, completedLessons, percent }

    return Response.json({ success: true, progressEntry, courseProgress })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update progress"
    return Response.json({ error: message }, { status: 500 })
  }
}
