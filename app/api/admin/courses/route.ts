import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const q = url.searchParams.get("q")?.trim() ?? ""
  const featured = url.searchParams.get("featured")

  const where: Record<string, unknown> = {}
  if (status && ["draft", "pending", "approved", "rejected", "suspended"].includes(status)) where.status = status
  if (featured === "true") where.featured = true
  if (featured === "false") where.featured = false
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { moderationNote: { contains: q, mode: "insensitive" } },
      { instructor: { name: { contains: q, mode: "insensitive" } } },
    ]
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, sections: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return Response.json({ courses })
}

const PatchSchema = z.object({
  courseId: z.string().uuid(),
  action: z.enum(["approve", "reject", "suspend", "delete", "feature", "unfeature", "setCategory"]),
  categoryId: z.string().uuid().nullable().optional(),
})

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const { courseId, action, categoryId } = parsed.data

  if (action === "delete") {
    await prisma.course.delete({ where: { id: courseId } })
    return Response.json({ success: true })
  }

  if (action === "feature" || action === "unfeature") {
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { featured: action === "feature" },
      select: { id: true, featured: true },
    })
    return Response.json({ success: true, course: updated })
  }

  if (action === "setCategory") {
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { categoryId: categoryId ?? null },
      select: { id: true, categoryId: true },
    })
    return Response.json({ success: true, course: updated })
  }

  const statusMap = {
    approve: "approved",
    reject: "rejected",
    suspend: "suspended",
  } as const

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: { status: statusMap[action], updatedAt: new Date() },
    select: { id: true, status: true },
  })

  return Response.json({ success: true, course: updated })
}
