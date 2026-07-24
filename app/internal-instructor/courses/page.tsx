import { InternalInstructorCoursesTable } from "@/components/internal-instructor/internal-instructor-courses-table"

export default function InternalInstructorCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-gradient-to-r from-background via-muted/30 to-primary/5 p-5 shadow-xs">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">My Courses</h1>
        <p className="mt-2 text-muted-foreground">
          Create, edit, and submit platform-owned courses for admin approval
        </p>
      </div>
      <InternalInstructorCoursesTable />
    </div>
  )
}
