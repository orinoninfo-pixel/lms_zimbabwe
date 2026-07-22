import { InternalInstructorCoursesTable } from "@/components/internal-instructor/internal-instructor-courses-table"

export default function InternalInstructorCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground">
          Create, edit, and submit platform-owned courses for admin approval
        </p>
      </div>
      <InternalInstructorCoursesTable />
    </div>
  )
}
