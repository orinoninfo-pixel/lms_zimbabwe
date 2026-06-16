import { AdminReportsTable } from "@/components/admin/admin-reports-table"

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Review and resolve user reports and course complaints</p>
      </div>
      <AdminReportsTable />
    </div>
  )
}
