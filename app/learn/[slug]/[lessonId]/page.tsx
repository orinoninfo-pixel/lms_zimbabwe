import LearnView from "@/components/learn/learn-view"

export default async function LearnLessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params
  return <LearnView slug={slug} initialLessonId={lessonId} />
}
