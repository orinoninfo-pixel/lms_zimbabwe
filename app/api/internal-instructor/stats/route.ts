import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

export async function GET() {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const courses = await prisma.course.findMany({
    where: { instructorId: auth.user.id },
    select: {
      id: true,
      title: true,
      status: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const courseIds = courses.map((c) => c.id)
  const totalEnrollments = courses.reduce((sum, c) => sum + c._count.enrollments, 0)

  const [distinctStudents, totalLessonsRows, enrollments] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    Promise.all(
      courseIds.map(async (id) => ({ id, total: await prisma.lesson.count({ where: { section: { courseId: id } } }) }))
    ),
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { userId: true, courseId: true },
    }),
  ])

  const totalLessonsByCourseId = new Map(totalLessonsRows.map((r) => [r.id, r.total]))

  const progress = await prisma.progress.findMany({
    where: {
      completed: true,
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

  const percentByCourse = new Map<string, number[]>()
  for (const e of enrollments) {
    const total = totalLessonsByCourseId.get(e.courseId) ?? 0
    const completed = completedByUserCourse.get(`${e.userId}:${e.courseId}`) ?? 0
    const percent = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100))
    const list = percentByCourse.get(e.courseId) ?? []
    list.push(percent)
    percentByCourse.set(e.courseId, list)
  }

  const courseCounts = {
    total: courses.length,
    draft: courses.filter((c) => c.status === "draft").length,
    pending: courses.filter((c) => c.status === "pending").length,
    approved: courses.filter((c) => c.status === "approved").length,
    rejected: courses.filter((c) => c.status === "rejected").length,
    suspended: courses.filter((c) => c.status === "suspended").length,
  }

  const coursePerformance = courses.map((c) => {
    const percents = percentByCourse.get(c.id) ?? []
    const avgCompletion =
      percents.length === 0 ? 0 : Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length)
    return {
      id: c.id,
      title: c.title,
      status: c.status,
      enrollments: c._count.enrollments,
      avgCompletionPercent: avgCompletion,
    }
  })

  return Response.json({
    courseCounts,
    totalEnrollments,
    totalStudents: distinctStudents.length,
    coursePerformance,
  })
}
