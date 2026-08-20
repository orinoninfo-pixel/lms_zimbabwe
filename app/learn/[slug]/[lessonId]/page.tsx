import { redirect } from "next/navigation"
import LearnView from "@/components/learn/learn-view"
import { prisma } from "@/lib/prisma"
import { requireRoleForPage } from "@/lib/rbac"
import { TutorialRoute } from "@/components/tutorials/tutorial-route"
import { UUID_PATTERN } from "@/lib/tutorials"

export default async function LearnLessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params
  if (!UUID_PATTERN.test(slug)) return <TutorialRoute tutorialSlug={slug} lessonSlug={lessonId} />
  const auth = await requireRoleForPage("student")
  if (!auth) redirect(`/login?next=${encodeURIComponent(`/learn/${slug}/${lessonId}`)}`)

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: auth.user.id, courseId: slug } },
    select: { id: true },
  })
  if (!enrollment) redirect(`/course/${slug}`)

  return <LearnView slug={slug} initialLessonId={lessonId} />
}
