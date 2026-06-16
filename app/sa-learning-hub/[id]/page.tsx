import { redirect } from "next/navigation"

export default async function SubjectPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/zimbabwe-learning-hub/${id}`)
}
