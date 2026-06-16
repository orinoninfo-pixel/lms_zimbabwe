import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CertificatesList } from "@/components/dashboard/certificates-list"

export default async function CertificatesPage() {
  const auth = await requireRoleForPage("student")
  if (!auth) redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Certificates</h1>
            <p className="text-sm text-muted-foreground">Download certificates for completed courses</p>
          </div>
          <CertificatesList />
        </main>
      </div>
    </div>
  )
}
