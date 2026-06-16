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
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back{auth.user.name ? `, ${auth.user.name}` : ""}!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your courses today.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <InstructorStats />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Courses Table - Takes 2 columns */}
            <div className="lg:col-span-2">
              <InstructorCoursesTable />
            </div>

            {/* Recent Enrollments Sidebar */}
            <div className="lg:col-span-1">
              <RecentEnrollments />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
