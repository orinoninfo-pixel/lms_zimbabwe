import { AdminEnrollmentsTable } from "@/components/admin/admin-enrollments-table"

export default function AdminEnrollmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Enrollments</h1>
        <p className="text-muted-foreground">View student enrollments and learning progress</p>
      </div>
      <AdminEnrollmentsTable />
    </div>
  )
}
