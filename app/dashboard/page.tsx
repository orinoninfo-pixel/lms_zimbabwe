import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { ZimbabweLearningHubSummary } from "@/components/dashboard/zimbabwe-learning-hub-summary"
import { ContinueLearning } from "@/components/dashboard/continue-learning"
import { EnrolledCourses } from "@/components/dashboard/enrolled-courses"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"

export default async function DashboardPage() {
  const auth = await requireRoleForPage("student")
  if (!auth) redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 lg:p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome back{auth.user.name ? `, ${auth.user.name}` : ""}!
            </h1>
            <p className="mt-1 text-muted-foreground">
              {"Ready to continue your learning journey? You're making great progress!"}
            </p>
          </div>

          {/* Stats */}
          <DashboardStats />

          <ZimbabweLearningHubSummary userId={auth.user.id} />

          {/* Continue Learning */}
          <div className="mt-6">
            <ContinueLearning />
          </div>

          {/* Main Grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Enrolled Courses - Takes 2 columns */}
            <div className="lg:col-span-2">
              <EnrolledCourses />
            </div>

            {/* Recent Activity - Takes 1 column */}
            <div className="lg:col-span-1">
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
