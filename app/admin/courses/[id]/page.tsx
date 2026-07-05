import { AdminCourseReviewPage } from "@/components/admin/admin-course-review-page"

export const dynamic = "force-dynamic"

export default async function AdminCourseReviewRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <AdminCourseReviewPage courseId={id} />
}
