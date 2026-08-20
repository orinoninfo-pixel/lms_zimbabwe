import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireStudent } from "@/lib/rbac"

const BodySchema = z.object({ lessonId: z.string().uuid() })

async function context(req: Request, params: Promise<{ slug: string }>) {
  const auth = await requireStudent()
  if (auth instanceof Response) return { error: auth }
  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return { error: Response.json({ error: "Invalid request body" }, { status: 400 }) }
  const { slug } = await params
  const lesson = await prisma.tutorialLesson.findFirst({ where: { id: parsed.data.lessonId, isPublished: true, section: { tutorial: { slug, status: "published" } } }, select: { id: true, section: { select: { tutorialId: true } } } })
  if (!lesson) return { error: Response.json({ error: "Lesson not found" }, { status: 404 }) }
  return { auth, lesson }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const result = await context(req, params)
  if ("error" in result) return result.error
  await prisma.tutorialBookmark.upsert({ where: { userId_lessonId: { userId: result.auth.user.id, lessonId: result.lesson.id } }, update: {}, create: { userId: result.auth.user.id, tutorialId: result.lesson.section.tutorialId, lessonId: result.lesson.id } })
  return Response.json({ success: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const result = await context(req, params)
  if ("error" in result) return result.error
  await prisma.tutorialBookmark.deleteMany({ where: { userId: result.auth.user.id, lessonId: result.lesson.id } })
  return Response.json({ success: true })
}
