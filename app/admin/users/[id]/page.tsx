import { AdminUserReviewPage } from "@/components/admin/admin-user-review-page"

export const dynamic = "force-dynamic"

export default async function AdminUserReviewRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <AdminUserReviewPage userId={id} />
}
