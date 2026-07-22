import Link from "next/link"
import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/status-badge"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function InternalInstructorOverviewPage() {
  const auth = await requireRoleForPage("internal_instructor")
  if (!auth) redirect("/")

  const [courses, totalEnrollments] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: auth.user.id },
      select: { id: true, title: true, status: true, price: true, updatedAt: true, _count: { select: { enrollments: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.enrollment.count({ where: { course: { instructorId: auth.user.id } } }),
  ])

  const draftCount = courses.filter((c) => c.status === "draft").length
  const pendingCount = courses.filter((c) => c.status === "pending").length
  const approvedCount = courses.filter((c) => c.status === "approved").length
  const recentCourses = courses.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{auth.user.name ? `, ${auth.user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground">Here&apos;s the status of your platform-owned courses.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/internal-instructor/courses/new">
            <Plus className="h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{draftCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Approved (live)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{totalEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent courses</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/internal-instructor/courses">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No courses yet. Click &quot;New Course&quot; to create your first platform course.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course._count.enrollments} enrolled &middot; ${course.price}
                    </p>
                  </div>
                  <StatusBadge kind="course" value={course.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
