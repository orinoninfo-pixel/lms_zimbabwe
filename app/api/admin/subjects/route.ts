import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const examiningBody = url.searchParams.get("examiningBody")
  const q = url.searchParams.get("q")?.trim() ?? ""

  const where: Record<string, unknown> = {}
  if (status && ["draft", "pending", "approved", "rejected", "suspended"].includes(status)) where.status = status
  if (examiningBody && ["zimsec", "cambridge"].includes(examiningBody)) where.examiningBody = examiningBody
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { moderationNote: { contains: q, mode: "insensitive" } },
      { teacher: { name: { contains: q, mode: "insensitive" } } },
    ]
  }

  const subjects = await prisma.subjectPackage.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, liveLessons: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return Response.json({ subjects })
}

const PatchSchema = z.object({
  subjectId: z.string().uuid(),
  action: z.enum(["approve", "reject", "suspend", "delete", "setCategory"]),
  categoryId: z.string().uuid().nullable().optional(),
})

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const { subjectId, action, categoryId } = parsed.data

  if (action === "delete") {
    await prisma.subjectPackage.delete({ where: { id: subjectId } })
    return Response.json({ success: true })
  }

  if (action === "setCategory") {
    const updated = await prisma.subjectPackage.update({
      where: { id: subjectId },
      data: { categoryId: categoryId ?? null },
      select: { id: true, categoryId: true },
    })
    return Response.json({ success: true, subject: updated })
  }

  const statusMap = {
    approve: "approved",
    reject: "rejected",
    suspend: "suspended",
  } as const

  const updated = await prisma.subjectPackage.update({
    where: { id: subjectId },
    data: { status: statusMap[action], updatedAt: new Date() },
    select: { id: true, status: true },
  })

  return Response.json({ success: true, subject: updated })
}
