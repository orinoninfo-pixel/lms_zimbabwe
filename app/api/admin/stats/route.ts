import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { CurrencyCode } from "@/lib/generated/prisma/enums"

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const [
    users,
    students,
    instructors,
    pendingApplications,
    pendingCourses,
    approvedCourses,
    enrollments,
    openReports,
    revenueAgg,
    payoutsAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "instructor" } }),
    prisma.instructorApplication.count({ where: { status: "pending" } }),
    prisma.course.count({ where: { status: "pending" } }),
    prisma.course.count({ where: { status: "approved" } }),
    prisma.enrollment.count(),
    prisma.report.count({ where: { status: { in: ["open", "reviewing"] } } }),
    prisma.transaction.aggregate({
      where: { status: "succeeded", currency: CurrencyCode.USD, type: { in: ["enrollment", "commission"] } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "succeeded", currency: CurrencyCode.USD, type: "payout" },
      _sum: { amount: true },
    }),
  ])

  return Response.json({
    users,
    students,
    instructors,
    pendingApplications,
    pendingCourses,
    approvedCourses,
    enrollments,
    openReports,
    revenueUsd: revenueAgg._sum?.amount ?? 0,
    payoutsUsd: payoutsAgg._sum?.amount ?? 0,
  })
}
