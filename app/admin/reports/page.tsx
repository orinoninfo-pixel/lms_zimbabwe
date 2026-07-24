import { AdminReportsTable } from "@/components/admin/admin-reports-table"

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-gradient-to-r from-background via-muted/30 to-primary/5 p-5 shadow-xs">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Reports</h1>
        <p className="mt-2 text-muted-foreground">Review and resolve user reports and course complaints</p>
      </div>
      <AdminReportsTable />
    </div>
  )
}
