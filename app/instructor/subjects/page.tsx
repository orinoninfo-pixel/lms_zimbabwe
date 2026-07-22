import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"
import { InstructorSidebar } from "@/components/instructor/instructor-sidebar"
import { InstructorHeader } from "@/components/instructor/instructor-header"
import { SubjectsTable } from "@/components/shared/subjects-table"

export default async function InstructorSubjectsPage() {
  const auth = await requireRoleForPage("instructor")
  if (!auth) redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <InstructorSidebar />
      <div className="lg:pl-64">
        <InstructorHeader />
        <main className="p-4 lg:p-6">
          <SubjectsTable
            apiBasePath="/api/instructor/subjects"
            editHrefBase="/instructor/subjects"
            newHref="/instructor/subjects/new"
          />
        </main>
      </div>
    </div>
  )
}
