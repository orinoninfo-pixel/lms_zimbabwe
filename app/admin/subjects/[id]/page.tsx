import { AdminSubjectReviewPage } from "@/components/admin/admin-subject-review-page"

export const dynamic = "force-dynamic"

export default async function AdminSubjectReviewRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <AdminSubjectReviewPage subjectId={id} />
}
