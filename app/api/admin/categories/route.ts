import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, requireAdminOrInternalInstructor } from "@/lib/rbac"

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export async function GET() {
  const auth = await requireAdminOrInternalInstructor()
  if (auth instanceof Response) return auth

  const categories = await prisma.category.findMany({
    include: { _count: { select: { courses: true } } },
    orderBy: { name: "asc" },
  })

  return Response.json({ categories })
}

const CreateSchema = z.object({
  name: z.string().min(1).max(60),
})

export async function POST(req: Request) {
  const auth = await requireAdminOrInternalInstructor()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const name = parsed.data.name.trim()
  const slug = slugify(name)

  const created = await prisma.category.create({ data: { name, slug } })
  return Response.json({ success: true, category: created })
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(60),
})

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const name = parsed.data.name.trim()
  const slug = slugify(name)

  const updated = await prisma.category.update({
    where: { id: parsed.data.id },
    data: { name, slug },
  })
  return Response.json({ success: true, category: updated })
}

const DeleteSchema = z.object({ id: z.string().uuid() })

export async function DELETE(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = DeleteSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  await prisma.category.delete({ where: { id: parsed.data.id } })
  return Response.json({ success: true })
}

