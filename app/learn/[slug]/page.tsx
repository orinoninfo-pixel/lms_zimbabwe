import LearnView from "@/components/learn/learn-view"

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <LearnView slug={slug} />
}
