import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"
import { InternalInstructorSidebar } from "@/components/internal-instructor/internal-instructor-sidebar"
import { InternalInstructorHeader } from "@/components/internal-instructor/internal-instructor-header"

export default async function InternalInstructorLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireRoleForPage("internal_instructor")
  if (!auth) redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <InternalInstructorSidebar />
      <div className="lg:pl-64">
        <InternalInstructorHeader />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
