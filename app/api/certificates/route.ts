import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

async function ensureStudent() {
  const session = await getSession()
  if (!session) return { error: Response.json({ error: "Not logged in" }, { status: 401 }) }
  if (session.role !== "student") return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student") return { error: Response.json({ error: "Invalid session" }, { status: 401 }) }
  if (user.status !== "active") return { error: Response.json({ error: "Account disabled" }, { status: 403 }) }

  return { user }
}

export async function GET() {
  const auth = await ensureStudent()
  if ("error" in auth) return auth.error

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: auth.user.id },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const certificates = []
  for (const e of enrollments) {
    const totalLessons = await prisma.lesson.count({ where: { section: { courseId: e.courseId } } })
    if (totalLessons === 0) continue

    const completedLessons = await prisma.progress.count({
      where: { userId: auth.user.id, completed: true, lesson: { section: { courseId: e.courseId } } },
    })
    if (completedLessons !== totalLessons) continue

    const certificateId = `LFY-${e.id.replace(/-/g, "").slice(0, 16).toUpperCase()}`
    const cert = await prisma.certificate.upsert({
      where: { userId_courseId: { userId: auth.user.id, courseId: e.courseId } },
      update: {},
      create: { userId: auth.user.id, courseId: e.courseId, certificateId },
      include: { course: { select: { title: true } } },
    })
    certificates.push(cert)
  }

  return Response.json({
    certificates: certificates.map((c) => ({
      id: c.id,
      certificateId: c.certificateId,
      issuedAt: c.issuedAt,
      course: { id: c.courseId, title: c.course.title },
    })),
  })
}
