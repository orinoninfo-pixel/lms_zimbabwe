import { InternalInstructorReports } from "@/components/internal-instructor/internal-instructor-reports"

export default function InternalInstructorReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Performance metrics for your internal content</p>
      </div>
      <InternalInstructorReports />
    </div>
  )
}
