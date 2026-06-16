import { AdminUsersTable } from "@/components/admin/admin-users-table"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage students, instructors, and administrators</p>
      </div>
      <AdminUsersTable />
    </div>
  )
}
