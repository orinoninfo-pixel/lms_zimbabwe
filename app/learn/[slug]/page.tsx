import { redirect } from "next/navigation"
import LearnView from "@/components/learn/learn-view"
import { prisma } from "@/lib/prisma"
import { requireRoleForPage } from "@/lib/rbac"

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const auth = await requireRoleForPage("student")
  if (!auth) redirect(`/login?next=${encodeURIComponent(`/learn/${slug}`)}`)

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: auth.user.id, courseId: slug } },
    select: { id: true },
  })
  if (!enrollment) redirect(`/course/${slug}`)

  return <LearnView slug={slug} />
}
