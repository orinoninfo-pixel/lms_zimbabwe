import { SubjectEditor } from "@/components/shared/subject-editor"

export default function NewInternalInstructorSubjectPage() {
  return <SubjectEditor apiBasePath="/api/internal-instructor/subjects" backHref="/internal-instructor/subjects" />
}
