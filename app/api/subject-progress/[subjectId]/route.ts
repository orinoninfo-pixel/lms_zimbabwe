import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(_req: Request, context: { params: Promise<{ subjectId: string }> }) {
  const params = await context.params
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }
  if (session.role !== "student") {
    return Response.json({ error: "Only students can view progress" }, { status: 403 })
  }

  const userId = session.userId
  const subjectPackageId = params.subjectId

  const subjectExists = await prisma.subjectPackage.findUnique({
    where: { id: subjectPackageId },
    select: { id: true },
  })
  if (!subjectExists) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }

  const enrollment = await prisma.subjectEnrollment.findUnique({
    where: { userId_subjectPackageId: { userId, subjectPackageId } },
    select: { id: true, status: true },
  })
  if (!enrollment || enrollment.status !== "active") {
    return Response.json({ error: "An active subscription is required before viewing progress" }, { status: 403 })
  }

  const lessons = await prisma.subjectLesson.findMany({
    where: { section: { subjectPackageId } },
    select: { id: true },
    orderBy: { id: "asc" },
  })
  const lessonIds = lessons.map((l) => l.id)
  const totalLessons = lessonIds.length

  if (totalLessons === 0) {
    return Response.json({
      userId,
      subjectPackageId,
      totalLessons: 0,
      completedLessons: 0,
      percent: 0,
      completedLessonIds: [],
    })
  }

  const completed = await prisma.subjectLessonProgress.findMany({
    where: { userId, completed: true, lessonId: { in: lessonIds } },
    select: { lessonId: true },
  })
  const completedLessonIds = completed.map((p) => p.lessonId)
  const completedLessons = completedLessonIds.length
  const percent = Math.round((completedLessons / totalLessons) * 100)

  return Response.json({
    userId,
    subjectPackageId,
    totalLessons,
    completedLessons,
    completedLessonIds,
    percent,
  })
}
