import { SubjectsTable } from "@/components/shared/subjects-table"

export default function InternalInstructorSubjectsPage() {
  return (
    <SubjectsTable
      apiBasePath="/api/internal-instructor/subjects"
      editHrefBase="/internal-instructor/subjects"
      newHref="/internal-instructor/subjects/new"
    />
  )
}
