import { AdminInstructorsTable } from "@/components/admin/admin-instructors-table"

export default function AdminInstructorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Instructors</h1>
        <p className="text-muted-foreground">Manage instructors, courses, and payouts</p>
      </div>
      <AdminInstructorsTable />
    </div>
  )
}
