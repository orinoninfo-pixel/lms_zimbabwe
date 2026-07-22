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
    select: { id: true, status: true },
  })
  const courseIds = courses.map((c) => c.id)

  const courseCounts = {
    total: courses.length,
    draft: courses.filter((c) => c.status === "draft").length,
    pending: courses.filter((c) => c.status === "pending").length,
    approved: courses.filter((c) => c.status === "approved").length,
    rejected: courses.filter((c) => c.status === "rejected").length,
    suspended: courses.filter((c) => c.status === "suspended").length,
  }

  const [
    distinctStudents,
    totalEnrollments,
    payoutAgg,
    pendingPayoutAgg,
    recentEnrollments,
    commissionSetting,
    payoutHistory,
  ] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
    prisma.transaction.aggregate({
      where: { type: "payout", userId: instructor.id, status: "succeeded", currency: "USD" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "payout", userId: instructor.id, status: "pending", currency: "USD" },
      _sum: { amount: true },
    }),
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        user: { select: { id: true, name: true } },
        course: { select: { id: true, title: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.platformSetting.findUnique({ where: { key: "commissionRateBps" }, select: { value: true } }),
    prisma.transaction.findMany({
      where: { type: "payout", userId: instructor.id },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  const paidOut = payoutAgg._sum?.amount ?? 0
  const pendingPayout = pendingPayoutAgg._sum?.amount ?? 0

  const parsedBps = commissionSetting?.value ? Number.parseInt(commissionSetting.value, 10) : Number.NaN
  const commissionRateBps = Number.isFinite(parsedBps) ? Math.max(0, Math.min(10_000, parsedBps)) : 1500
  const platformCommissionPercent = commissionRateBps / 100
  const instructorSharePercent = 100 - platformCommissionPercent

  return Response.json({
    totalStudents: distinctStudents.length,
    totalEnrollments,
    courseCounts,
    earnings: {
      total: paidOut + pendingPayout,
      paidOut,
      pending: pendingPayout,
    },
    revenueSplit: {
      commissionRateBps,
      platformCommissionPercent,
      instructorSharePercent,
    },
    recentEnrollments: recentEnrollments.map((e) => ({
      id: e.id,
      studentName: e.user.name,
      courseTitle: e.course.title,
      amount: e.course.price,
      createdAt: e.createdAt,
    })),
    payoutHistory: payoutHistory.map((t) => ({
      id: t.id,
      courseTitle: t.course?.title ?? "—",
      amount: t.amount,
      status: t.status,
      reference: t.reference,
      createdAt: t.createdAt,
    })),
  })
}
