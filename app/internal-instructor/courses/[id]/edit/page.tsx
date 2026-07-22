import { InternalInstructorCourseEdit } from "@/components/internal-instructor/internal-instructor-course-edit"

export const dynamic = "force-dynamic"

export default async function EditInternalCourseRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <InternalInstructorCourseEdit courseId={id} />
}
