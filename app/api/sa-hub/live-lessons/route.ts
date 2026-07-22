import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const grade = url.searchParams.get("grade")
  const subject = url.searchParams.get("subject")?.trim()
  const subjectPackageId = url.searchParams.get("subjectPackageId")
  const courseId = url.searchParams.get("courseId")

  const where: Record<string, unknown> = {}
  if (status && ["upcoming", "completed", "canceled"].includes(status)) where.status = status
  if (grade) {
    const parsed = z.coerce.number().int().min(1).max(12).safeParse(grade)
    if (parsed.success) where.grade = parsed.data
  }
  if (subject) where.subject = { contains: subject, mode: "insensitive" }
  if (subjectPackageId) where.subjectPackageId = subjectPackageId
  if (courseId) where.courseId = courseId

  const lessons = await prisma.liveLesson.findMany({
    where,
    include: { teacher: { select: { id: true, name: true, email: true } } },
    orderBy: { startsAt: status === "completed" ? "desc" : "asc" },
    take: 100,
  })

  const session = await getSession()
  const studentId = session?.role === "student" ? session.userId : null

  const packageIds = Array.from(new Set(lessons.map((l) => l.subjectPackageId).filter(Boolean))) as string[]
  const activePackageIds = new Set<string>()

  const courseIds = Array.from(new Set(lessons.map((l) => l.courseId).filter(Boolean))) as string[]
  const enrolledCourseIds = new Set<string>()

  if (studentId) {
    const [packageEnrollments, courseEnrollments] = await Promise.all([
      packageIds.length
        ? prisma.subjectEnrollment.findMany({
            where: {
              userId: studentId,
              subjectPackageId: { in: packageIds },
              status: "active",
              OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
            },
            select: { subjectPackageId: true },
          })
        : Promise.resolve([]),
      courseIds.length
        ? prisma.enrollment.findMany({
            where: { userId: studentId, courseId: { in: courseIds } },
            select: { courseId: true },
          })
        : Promise.resolve([]),
    ])
    for (const e of packageEnrollments) activePackageIds.add(e.subjectPackageId)
    for (const e of courseEnrollments) enrolledCourseIds.add(e.courseId)
  }

  const canAccess = (l: (typeof lessons)[number]) => {
    if (l.subjectPackageId) return activePackageIds.has(l.subjectPackageId)
    if (l.courseId) return enrolledCourseIds.has(l.courseId)
    // A lesson tied to neither a subject package nor a course has no
    // enrollment to check against — any logged-in student can join.
    return Boolean(studentId)
  }

  return Response.json({
    lessons: lessons.map((l) => {
      const access = canAccess(l)
      return {
        id: l.id,
        title: l.title,
        subject: l.subject,
        grade: l.grade,
        status: l.status,
        startsAt: l.startsAt,
        durationMinutes: l.durationMinutes,
        subjectPackageId: l.subjectPackageId,
        courseId: l.courseId,
        canJoin: access,
        meetingLink: access ? l.meetingLink : null,
        recordingUrl: l.recordingUrl,
        teacher: l.teacher,
      }
    }),
  })
}
