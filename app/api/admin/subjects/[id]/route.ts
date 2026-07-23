import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

const UpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  moderationNote: z.string().trim().max(5000).nullable().optional(),
  price: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  examiningBody: z.enum(["zimsec", "cambridge"]).optional(),
  status: z.enum(["draft", "pending", "approved", "rejected", "suspended"]).optional(),
})

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const { id } = await context.params

  const subject = await prisma.subjectPackage.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      sections: {
        orderBy: [{ order: "asc" }, { title: "asc" }],
        include: {
          lessons: {
            orderBy: [{ order: "asc" }, { title: "asc" }],
            select: { id: true, title: true, videoUrl: true, order: true },
          },
        },
      },
      _count: { select: { enrollments: true, liveLessons: true, homework: true } },
    },
  })

  if (!subject) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }

  return Response.json({ subject })
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const { id } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const data = parsed.data
  const updateData: Record<string, unknown> = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.moderationNote !== undefined) updateData.moderationNote = data.moderationNote
  if (data.price !== undefined) updateData.price = data.price
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
  if (data.examiningBody !== undefined) updateData.examiningBody = data.examiningBody
  if (data.status !== undefined) updateData.status = data.status

  const updated = await prisma.subjectPackage.update({
    where: { id },
    data: updateData,
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, liveLessons: true } },
    },
  })

  return Response.json({ success: true, subject: updated })
}
