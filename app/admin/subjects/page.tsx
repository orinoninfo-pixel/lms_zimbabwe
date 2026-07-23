import { AdminSubjectsTable } from "@/components/admin/admin-subjects-table"

export default function AdminSubjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subjects</h1>
        <p className="text-muted-foreground">Approve, reject, suspend, and delete subject packages</p>
      </div>
      <AdminSubjectsTable />
    </div>
  )
}
