import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"
import { InstructorSidebar } from "@/components/instructor/instructor-sidebar"
import { InstructorHeader } from "@/components/instructor/instructor-header"
import { InstructorCourseEdit } from "@/components/instructor/instructor-course-edit"

export const dynamic = "force-dynamic"

export default async function EditInstructorCourseRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const auth = await requireRoleForPage("instructor")
  if (!auth) redirect("/")

  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <InstructorSidebar />
      <div className="lg:pl-64">
        <InstructorHeader />
        <main className="p-4 lg:p-6">
          <InstructorCourseEdit courseId={id} />
        </main>
      </div>
    </div>
  )
}
