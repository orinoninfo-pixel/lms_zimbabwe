import { SubjectEditor } from "@/components/shared/subject-editor"

export const dynamic = "force-dynamic"

export default async function EditInternalInstructorSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <SubjectEditor
      apiBasePath="/api/internal-instructor/subjects"
      backHref="/internal-instructor/subjects"
      subjectId={id}
    />
  )
}
