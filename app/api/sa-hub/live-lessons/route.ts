import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const grade = url.searchParams.get("grade")
  const subject = url.searchParams.get("subject")?.trim()
  const subjectPackageId = url.searchParams.get("subjectPackageId")

  const where: Record<string, unknown> = {}
  if (status && ["upcoming", "completed", "canceled"].includes(status)) where.status = status
  if (grade) {
    const parsed = z.coerce.number().int().min(1).max(12).safeParse(grade)
    if (parsed.success) where.grade = parsed.data
  }
  if (subject) where.subject = { contains: subject, mode: "insensitive" }
  if (subjectPackageId) where.subjectPackageId = subjectPackageId

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

  if (studentId && packageIds.length) {
    const enrollments = await prisma.subjectEnrollment.findMany({
      where: {
        userId: studentId,
        subjectPackageId: { in: packageIds },
        status: "active",
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      select: { subjectPackageId: true },
    })
    for (const e of enrollments) activePackageIds.add(e.subjectPackageId)
  }

  return Response.json({
    lessons: lessons.map((l) => ({
      id: l.id,
      title: l.title,
      subject: l.subject,
      grade: l.grade,
      status: l.status,
      startsAt: l.startsAt,
      durationMinutes: l.durationMinutes,
      subjectPackageId: l.subjectPackageId,
      canJoin: l.subjectPackageId ? activePackageIds.has(l.subjectPackageId) : Boolean(studentId),
      meetingLink: l.subjectPackageId ? (activePackageIds.has(l.subjectPackageId) ? l.meetingLink : null) : l.meetingLink,
      recordingUrl: l.recordingUrl,
      teacher: l.teacher,
    })),
  })
}
