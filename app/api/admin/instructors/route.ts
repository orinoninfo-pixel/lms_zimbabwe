import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const q = url.searchParams.get("q")?.trim() ?? ""

  const where: Record<string, unknown> = { role: "instructor" }
  if (status && ["active", "suspended", "banned"].includes(status)) where.status = status
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ]
  }

  const instructors = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { courses: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const courseIds = await prisma.course.findMany({
    where: { instructorId: { in: instructors.map((i) => i.id) } },
    select: { id: true, instructorId: true },
  })

  const courseIdsByInstructor = new Map<string, string[]>()
  for (const c of courseIds) {
    const list = courseIdsByInstructor.get(c.instructorId) ?? []
    list.push(c.id)
    courseIdsByInstructor.set(c.instructorId, list)
  }

  const enrollmentCounts = await prisma.enrollment.groupBy({
    by: ["courseId"],
    where: { courseId: { in: courseIds.map((c) => c.id) } },
    _count: { _all: true },
  })

  const enrollmentCountByCourseId = new Map(enrollmentCounts.map((r) => [r.courseId, r._count._all]))

  const instructorPayoutAgg = await prisma.transaction.groupBy({
    by: ["userId"],
    where: { type: "payout", status: "succeeded", currency: "USD", userId: { in: instructors.map((i) => i.id) } },
    _sum: { amount: true },
  })

  const payoutByInstructorId = new Map(instructorPayoutAgg.map((r) => [r.userId ?? "", r._sum.amount ?? 0]))

  return Response.json({
    instructors: instructors.map((i) => {
      const ids = courseIdsByInstructor.get(i.id) ?? []
      const students = ids.reduce((sum, courseId) => sum + (enrollmentCountByCourseId.get(courseId) ?? 0), 0)
      return {
        id: i.id,
        name: i.name,
        email: i.email,
        role: i.role,
        status: i.status,
        createdAt: i.createdAt,
        courses: i._count.courses,
        students,
        payoutsUsd: payoutByInstructorId.get(i.id) ?? 0,
      }
    }),
  })
}
