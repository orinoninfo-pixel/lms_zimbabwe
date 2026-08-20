import { prisma } from "@/lib/prisma"
import { requireAdminOrInternalInstructor } from "@/lib/rbac"
import { TutorialMetadataSchema } from "@/lib/tutorial-validation"

export async function GET() {
  const auth = await requireAdminOrInternalInstructor()
  if (auth instanceof Response) return auth
  const tutorials = await prisma.tutorial.findMany({ include: { _count: { select: { sections: true } } }, orderBy: { updatedAt: "desc" } })
  return Response.json({ tutorials })
}

export async function POST(req: Request) {
  const auth = await requireAdminOrInternalInstructor()
  if (auth instanceof Response) return auth
  const parsed = TutorialMetadataSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: "Invalid tutorial", details: parsed.error.flatten().fieldErrors }, { status: 400 })
  const tutorial = await prisma.tutorial.create({ data: { ...parsed.data, icon: parsed.data.icon || null, imageUrl: parsed.data.imageUrl || null, publishedAt: parsed.data.status === "published" ? new Date() : null, createdById: auth.user.id, updatedById: auth.user.id } })
  return Response.json({ tutorial }, { status: 201 })
}
