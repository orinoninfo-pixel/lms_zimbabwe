import { InternalInstructorCategoriesTable } from "@/components/internal-instructor/internal-instructor-categories-table"

export default function InternalInstructorCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground">View and add course taxonomies</p>
      </div>
      <InternalInstructorCategoriesTable />
    </div>
  )
}
