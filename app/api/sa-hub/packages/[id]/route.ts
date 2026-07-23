import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  const pkg = await prisma.subjectPackage.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true } },
      liveLessons: { orderBy: { startsAt: "asc" }, take: 50 },
      homework: { orderBy: { dueAt: "asc" }, take: 50 },
      examResources: { orderBy: [{ year: "desc" }, { createdAt: "desc" }], take: 100 },
      resources: { orderBy: { createdAt: "desc" }, take: 100 },
      announcements: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  })

  if (!pkg) return Response.json({ error: "Not found" }, { status: 404 })

  const session = await getSession()

  if (pkg.status !== "approved") {
    const canPreview =
      session?.role === "admin" ||
      ((session?.role === "instructor" || session?.role === "internal_instructor") && session.userId === pkg.teacherId)
    if (!canPreview) return Response.json({ error: "Not found" }, { status: 404 })
  }

  const studentId = session?.role === "student" ? session.userId : null

  let enrollment: { status: string; endDate: string | null; price: number; billingPeriod: string } | null = null
  let hasActiveAccess = false

  if (studentId) {
    const e = await prisma.subjectEnrollment.findUnique({
      where: { userId_subjectPackageId: { userId: studentId, subjectPackageId: pkg.id } },
      select: { status: true, endDate: true, price: true, billingPeriod: true },
    })
    if (e) {
      enrollment = {
        status: e.status,
        endDate: e.endDate ? e.endDate.toISOString() : null,
        price: e.price,
        billingPeriod: e.billingPeriod,
      }
      hasActiveAccess = e.status === "active" && (!e.endDate || e.endDate > new Date())
    }
  }

  return Response.json({
    package: {
      id: pkg.id,
      title: pkg.title,
      description: pkg.description,
      subject: pkg.subject,
      grade: pkg.grade,
      term: pkg.term,
      price: pkg.price,
      currency: pkg.currency,
      billingPeriod: pkg.billingPeriod,
      isCapsAligned: pkg.isCapsAligned,
      includesLiveLessons: pkg.includesLiveLessons,
      isExamPrep: pkg.isExamPrep,
      isHolidayLearning: pkg.isHolidayLearning,
      teacherName: pkg.teacher?.name ?? null,
      enrollment,
      hasActiveAccess,
      liveLessons: pkg.liveLessons.map((l) => ({
        id: l.id,
        title: l.title,
        status: l.status,
        startsAt: l.startsAt,
        durationMinutes: l.durationMinutes,
        teacherId: l.teacherId,
        meetingLink: hasActiveAccess ? l.meetingLink : null,
        recordingUrl: hasActiveAccess ? l.recordingUrl : null,
      })),
      homework: hasActiveAccess
        ? pkg.homework.map((h) => ({
            id: h.id,
            title: h.title,
            description: h.description,
            dueAt: h.dueAt,
            subject: h.subject,
            grade: h.grade,
          }))
        : pkg.homework.slice(0, 3).map((h) => ({ id: h.id, title: h.title, dueAt: h.dueAt, subject: h.subject, grade: h.grade })),
      examResources: hasActiveAccess
        ? pkg.examResources
        : pkg.examResources.map((r) => ({ ...r, fileUrl: null })),
      resources: hasActiveAccess
        ? pkg.resources
        : pkg.resources.map((r) => ({ ...r, fileUrl: null })),
      announcements: pkg.announcements,
    },
  })
}
