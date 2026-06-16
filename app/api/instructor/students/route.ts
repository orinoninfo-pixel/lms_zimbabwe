import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

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

  const courseTotals = await Promise.all(
    courses.map(async (c) => {
      const totalLessons = await prisma.lesson.count({ where: { section: { courseId: c.id } } })
      return { courseId: c.id, totalLessons, price: c.price }
    })
  )

  const totalsByCourseId = new Map(courseTotals.map((t) => [t.courseId, t]))

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courses.map((c) => c.id) } },
    include: { user: { select: { id: true, name: true, email: true } }, course: { select: { id: true, title: true } } },
    orderBy: { id: "desc" },
  })

  const rows = await Promise.all(
    enrollments.map(async (e) => {
      const totals = totalsByCourseId.get(e.courseId)
      const totalLessons = totals?.totalLessons ?? 0
      const completedLessons = await prisma.progress.count({
        where: {
          userId: e.userId,
          completed: true,
          lesson: { section: { courseId: e.courseId } },
        },
      })
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
  )

  return Response.json({
    totalStudents: new Set(rows.map((r) => r.userId)).size,
    rows,
  })
}

