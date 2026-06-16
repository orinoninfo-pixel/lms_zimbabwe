import { AdminCoursesTable } from "@/components/admin/admin-courses-table"

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <p className="text-muted-foreground">Approve, reject, suspend, delete, and feature courses</p>
      </div>
      <AdminCoursesTable />
    </div>
  )
}
