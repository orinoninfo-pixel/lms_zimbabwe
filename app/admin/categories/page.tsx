import { AdminCategoriesTable } from "@/components/admin/admin-categories-table"

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground">Create and manage course categories</p>
      </div>
      <AdminCategoriesTable />
    </div>
  )
}
