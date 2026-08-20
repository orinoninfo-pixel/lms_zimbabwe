import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireStudent } from "@/lib/rbac"

const BodySchema = z.object({ lessonId: z.string().uuid(), completed: z.boolean() })

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireStudent()
  if (auth instanceof Response) return auth
  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })
  const { slug } = await params
  const lesson = await prisma.tutorialLesson.findFirst({ where: { id: parsed.data.lessonId, isPublished: true, section: { tutorial: { slug, status: "published" } } }, select: { id: true, section: { select: { tutorialId: true } } } })
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 })
  const progress = await prisma.tutorialProgress.upsert({
    where: { userId_lessonId: { userId: auth.user.id, lessonId: lesson.id } },
    update: { completedAt: parsed.data.completed ? new Date() : null, lastViewedAt: new Date() },
    create: { userId: auth.user.id, tutorialId: lesson.section.tutorialId, lessonId: lesson.id, completedAt: parsed.data.completed ? new Date() : null },
  })
  return Response.json({ success: true, completedAt: progress.completedAt })
}
