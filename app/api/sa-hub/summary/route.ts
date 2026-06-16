import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "student") return Response.json({ error: "Forbidden" }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student") return Response.json({ error: "Invalid session" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Account disabled" }, { status: 403 })

  const now = new Date()

  const [upcoming, pendingHomework, examResourcesCount, holidayCoursesCount] = await Promise.all([
    prisma.liveLesson.findFirst({
      where: { startsAt: { gte: now }, status: "upcoming" },
      orderBy: { startsAt: "asc" },
      include: { teacher: { select: { name: true } } },
    }),
    prisma.homeworkAssignment.count({
      where: {
        dueAt: { gte: now },
        submissions: { none: { studentId: user.id, status: { in: ["submitted", "graded"] } } },
      },
    }),
    prisma.examResource.count({ where: { grade: { in: [12, 11, 10] } } }),
    prisma.course.count({
      where: {
        status: "approved",
        category: { slug: { in: ["holiday-catch-up", "exam-preparation", "homework-help"] } },
      },
    }),
  ])

  return Response.json({
    upcomingLiveLesson: upcoming
      ? {
          id: upcoming.id,
          title: upcoming.title,
          subject: upcoming.subject,
          grade: upcoming.grade,
          startsAt: upcoming.startsAt,
          teacherName: upcoming.teacher.name,
        }
      : null,
    pendingHomework,
    examResourcesCount,
    holidayCoursesCount,
  })
}
