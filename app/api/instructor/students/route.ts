import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { getCompletedLessonTotals, getCourseLessonTotals } from "@/lib/course-progress"

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "instructor") return Response.json({ error: "Forbidden" }, { status: 403 })

  const instructor = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  })
  if (!instructor || instructor.role !== "instructor") {
    return Response.json({ error: "Invalid session" }, { status: 401 })
  }

  const courses = await prisma.course.findMany({
    where: { instructorId: instructor.id },
    select: { id: true, title: true, price: true },
    orderBy: { title: "asc" },
  })

  const courseIds = courses.map((course) => course.id)
  const totalLessonsByCourseId = await getCourseLessonTotals(courseIds)

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    include: { user: { select: { id: true, name: true, email: true } }, course: { select: { id: true, title: true } } },
    orderBy: { id: "desc" },
  })

  const completedTotals = await getCompletedLessonTotals(courseIds, Array.from(new Set(enrollments.map((enrollment) => enrollment.userId))))
  const rows = enrollments.map((e) => {
      const totalLessons = totalLessonsByCourseId.get(e.courseId) ?? 0
      const completedLessons = completedTotals.get(`${e.userId}:${e.courseId}`) ?? 0
      const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)
      return {
        courseId: e.courseId,
        courseTitle: e.course.title,
        userId: e.userId,
        studentName: e.user.name,
        studentEmail: e.user.email,
        completedLessons,
        totalLessons,
        percent,
      }
    })

  return Response.json({
    totalStudents: new Set(rows.map((r) => r.userId)).size,
    rows,
  })
}

