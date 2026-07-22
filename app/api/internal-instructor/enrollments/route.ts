import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

export async function GET(req: Request) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const courseId = url.searchParams.get("courseId")

  const where: Record<string, unknown> = {
    course: { instructorId: auth.user.id },
  }
  if (courseId) where.courseId = courseId

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, price: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const courseIds = Array.from(new Set(enrollments.map((e) => e.courseId)))
  const userIds = Array.from(new Set(enrollments.map((e) => e.userId)))

  const totalLessonsByCourseId = new Map<string, number>()
  const totalLessons = await Promise.all(
    courseIds.map(async (id) => ({ id, total: await prisma.lesson.count({ where: { section: { courseId: id } } }) }))
  )
  for (const row of totalLessons) totalLessonsByCourseId.set(row.id, row.total)

  const progress = await prisma.progress.findMany({
    where: {
      completed: true,
      userId: { in: userIds },
      lesson: { section: { courseId: { in: courseIds } } },
    },
    select: { userId: true, lesson: { select: { section: { select: { courseId: true } } } } },
  })

  const completedByUserCourse = new Map<string, number>()
  for (const p of progress) {
    const cid = p.lesson.section.courseId
    const key = `${p.userId}:${cid}`
    completedByUserCourse.set(key, (completedByUserCourse.get(key) ?? 0) + 1)
  }

  return Response.json({
    enrollments: enrollments.map((e) => {
      const total = totalLessonsByCourseId.get(e.courseId) ?? 0
      const completed = completedByUserCourse.get(`${e.userId}:${e.courseId}`) ?? 0
      const percent = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100))
      return {
        id: e.id,
        createdAt: e.createdAt,
        user: e.user,
        course: e.course,
        progress: { totalLessons: total, completedLessons: completed, percent },
      }
    }),
  })
}
