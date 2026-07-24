import { InstructorSidebar } from "@/components/instructor/instructor-sidebar"
import { InstructorHeader } from "@/components/instructor/instructor-header"
import { InstructorStats } from "@/components/instructor/instructor-stats"
import { InstructorCoursesTable } from "@/components/instructor/instructor-courses-table"
import { RecentEnrollments } from "@/components/instructor/recent-enrollments"
import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"

export default async function InstructorDashboard() {
  const auth = await requireRoleForPage("instructor")
  if (!auth) redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <InstructorSidebar />

      <div className="lg:pl-64">
        <InstructorHeader />

        <main className="p-4 lg:p-6">
          <div className="mb-6 rounded-lg border border-border bg-gradient-to-r from-background via-muted/30 to-primary/5 p-5 shadow-xs">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              Welcome back{auth.user.name ? `, ${auth.user.name}` : ""}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Here&apos;s what&apos;s happening with your courses today.
            </p>
          </div>

          <div className="mb-6">
            <InstructorStats />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <InstructorCoursesTable />
            </div>

            <div className="lg:col-span-1">
              <RecentEnrollments />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
