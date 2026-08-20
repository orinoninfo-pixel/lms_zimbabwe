import { prisma } from "@/lib/prisma"

export async function getCourseLessonTotals(courseIds: string[]) {
  if (!courseIds.length) return new Map<string, number>()
  const lessons = await prisma.lesson.findMany({ where: { section: { courseId: { in: courseIds } } }, select: { section: { select: { courseId: true } } } })
  const totals = new Map<string, number>()
  for (const lesson of lessons) totals.set(lesson.section.courseId, (totals.get(lesson.section.courseId) ?? 0) + 1)
  return totals
}

export async function getCompletedLessonTotals(courseIds: string[], userIds?: string[]) {
  if (!courseIds.length) return new Map<string, number>()
  const progress = await prisma.progress.findMany({ where: { completed: true, ...(userIds ? { userId: { in: userIds } } : {}), lesson: { section: { courseId: { in: courseIds } } } }, select: { userId: true, lesson: { select: { section: { select: { courseId: true } } } } } })
  const totals = new Map<string, number>()
  for (const row of progress) { const key = `${row.userId}:${row.lesson.section.courseId}`; totals.set(key, (totals.get(key) ?? 0) + 1) }
  return totals
}

export async function getStudentCourseSummaries(userId: string) {
  const enrollments = await prisma.enrollment.findMany({ where: { userId }, include: { course: { include: { instructor: { select: { name: true } } } } }, orderBy: { createdAt: "desc" } })
  const courseIds = enrollments.map((enrollment) => enrollment.courseId)
  const [lessons, completedTotals] = await Promise.all([
    prisma.lesson.findMany({ where: { section: { courseId: { in: courseIds } } }, select: { id: true, section: { select: { courseId: true, order: true } }, order: true }, orderBy: [{ section: { order: "asc" } }, { order: "asc" }, { id: "asc" }] }),
    getCompletedLessonTotals(courseIds, [userId]),
  ])
  const lessonIdsByCourse = new Map<string, string[]>()
  for (const lesson of lessons) { const list = lessonIdsByCourse.get(lesson.section.courseId) ?? []; list.push(lesson.id); lessonIdsByCourse.set(lesson.section.courseId, list) }
  return enrollments.map(({ course }) => {
    const courseLessonIds = lessonIdsByCourse.get(course.id) ?? []
    const completedLessons = completedTotals.get(`${userId}:${course.id}`) ?? 0
    const totalLessons = courseLessonIds.length
    return { id: course.id, title: course.title, description: course.description, price: course.price, instructorId: course.instructorId, thumbnail: course.imageUrl ?? "/placeholder.jpg", instructorName: course.instructor.name, progressPercent: totalLessons ? Math.round(completedLessons / totalLessons * 100) : 0, totalLessons, completedLessons, firstLessonId: courseLessonIds[0] ?? null }
  })
}
