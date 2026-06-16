import { AdminInstructorApplicationsTable } from "@/components/admin/admin-instructor-applications-table"

export default function AdminInstructorApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Instructor Applications</h1>
        <p className="text-muted-foreground">Approve or reject instructor applications</p>
      </div>
      <AdminInstructorApplicationsTable />
    </div>
  )
}
