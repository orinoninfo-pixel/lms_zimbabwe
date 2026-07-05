import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(_req: Request, context: { params: Promise<{ courseId: string }> }) {
  const params = await context.params
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }
  if (session.role !== "student") {
    return Response.json({ error: "Only students can view progress" }, { status: 403 })
  }

  const userId = session.userId
  const courseId = params.courseId

  const courseExists = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  })
  if (!courseExists) {
    return Response.json({ error: "Course not found" }, { status: 404 })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  })
  if (!enrollment) {
    return Response.json({ error: "Course payment is required before viewing progress" }, { status: 403 })
  }

  const lessons = await prisma.lesson.findMany({
    where: { section: { courseId } },
    select: { id: true },
    orderBy: { id: "asc" },
  })
  const lessonIds = lessons.map((l) => l.id)
  const totalLessons = lessonIds.length

  if (totalLessons === 0) {
    return Response.json({
      userId,
      courseId,
      totalLessons: 0,
      completedLessons: 0,
      percent: 0,
      completedLessonIds: [],
    })
  }

  const completed = await prisma.progress.findMany({
    where: { userId, completed: true, lessonId: { in: lessonIds } },
    select: { lessonId: true },
  })
  const completedLessonIds = completed.map((p) => p.lessonId)
  const completedLessons = completedLessonIds.length
  const percent = Math.round((completedLessons / totalLessons) * 100)

  return Response.json({
    userId,
    courseId,
    totalLessons,
    completedLessons,
    completedLessonIds,
    percent,
  })
}
