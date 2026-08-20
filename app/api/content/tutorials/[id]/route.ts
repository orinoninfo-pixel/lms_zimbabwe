import { prisma } from "@/lib/prisma"
import { requireAdminOrInternalInstructor } from "@/lib/rbac"
import { TutorialMetadataSchema } from "@/lib/tutorial-validation"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrInternalInstructor()
  if (auth instanceof Response) return auth
  const { id } = await params
  const tutorial = await prisma.tutorial.findUnique({ where: { id }, include: { sections: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" }, include: { codeExamples: { orderBy: { order: "asc" } }, exercises: { orderBy: { order: "asc" } }, quiz: { include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } } } } } } } } })
  return tutorial ? Response.json({ tutorial }) : Response.json({ error: "Not found" }, { status: 404 })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrInternalInstructor()
  if (auth instanceof Response) return auth
  const parsed = TutorialMetadataSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: "Invalid tutorial", details: parsed.error.flatten().fieldErrors }, { status: 400 })
  const { id } = await params
  const existing = await prisma.tutorial.findUnique({ where: { id }, select: { status: true, publishedAt: true } })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })
  const tutorial = await prisma.tutorial.update({ where: { id }, data: { ...parsed.data, icon: parsed.data.icon || null, imageUrl: parsed.data.imageUrl || null, publishedAt: parsed.data.status === "published" ? existing.publishedAt ?? new Date() : null, updatedById: auth.user.id } })
  return Response.json({ tutorial })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrInternalInstructor()
  if (auth instanceof Response) return auth
  const { id } = await params
  await prisma.tutorial.delete({ where: { id } }).catch(() => null)
  return Response.json({ success: true })
}
