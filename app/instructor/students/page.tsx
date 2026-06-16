import { redirect } from "next/navigation"
import { InstructorSidebar } from "@/components/instructor/instructor-sidebar"
import { InstructorHeader } from "@/components/instructor/instructor-header"
import { InstructorStudentsTable } from "@/components/instructor/instructor-students-table"
import { requireRoleForPage } from "@/lib/rbac"

export default async function InstructorStudentsPage() {
  const auth = await requireRoleForPage("instructor")
  if (!auth) redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <InstructorSidebar />

      <div className="lg:pl-64">
        <InstructorHeader />

        <main className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Track learner progress across your courses</p>
          </div>

          <InstructorStudentsTable />
        </main>
      </div>
    </div>
  )
}
