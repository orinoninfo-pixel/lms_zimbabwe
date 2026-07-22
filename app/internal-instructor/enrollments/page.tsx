import { InternalInstructorEnrollmentsTable } from "@/components/internal-instructor/internal-instructor-enrollments-table"

export default function InternalInstructorEnrollmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Enrollments</h1>
        <p className="text-muted-foreground">Monitor student counts across your internal courses</p>
      </div>
      <InternalInstructorEnrollmentsTable />
    </div>
  )
}
