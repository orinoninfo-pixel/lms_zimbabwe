import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyCode } from "@/lib/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    pendingApplications,
    pendingCourses,
    openReports,
    totalEnrollments,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "instructor" } }),
    prisma.instructorApplication.count({ where: { status: "pending" } }),
    prisma.course.count({ where: { status: "pending" } }),
    prisma.report.count({ where: { status: { in: ["open", "reviewing"] } } }),
    prisma.enrollment.count(),
    prisma.transaction.aggregate({
      where: { status: "succeeded", currency: CurrencyCode.USD, type: { in: ["enrollment", "commission"] } },
      _sum: { amount: true },
    }),
  ])

  const revenueUsd = revenueAgg._sum?.amount ?? 0

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-gradient-to-r from-background via-muted/30 to-primary/5 p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Platform Overview</h1>
          <Badge variant="info">Admin Console</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">High-level statistics for the Zim Learning platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Instructors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{totalInstructors}</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{totalEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{pendingApplications}</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{pendingCourses}</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{openReports}</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Revenue (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{formatUsd(revenueUsd)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
