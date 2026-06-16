import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }
  if (session.role !== "student") {
    return Response.json({ error: "Only students can view enrolled courses" }, { status: 403 })
  }
  const userId = session.userId

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: { include: { instructor: { select: { name: true } } } } },
  })

  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = enrollment.course
      const totalLessons = await prisma.lesson.count({
        where: { section: { courseId: course.id } },
      })
      const completedLessons = await prisma.progress.count({
        where: { userId, completed: true, lesson: { section: { courseId: course.id } } },
      })
      const firstLessonId =
        (await prisma.lesson.findFirst({
          where: { section: { courseId: course.id } },
          select: { id: true },
          orderBy: { id: "asc" },
        }))?.id ?? null

      const progressPercent =
        totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        instructorId: course.instructorId,
        thumbnail: "/placeholder.jpg",
        instructorName: course.instructor.name,
        progressPercent,
        totalLessons,
        completedLessons,
        firstLessonId,
      }
    })
  )

  return Response.json({ userId, courses })
}
