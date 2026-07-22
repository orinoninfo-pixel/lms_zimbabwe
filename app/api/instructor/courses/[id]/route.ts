import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const UpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  price: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  action: z.enum(["submit"]).optional(),
})

async function requireInstructor() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== "instructor") return null

  const instructor = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } })
  if (!instructor || instructor.role !== "instructor") return null
  return instructor
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await context.params

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
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
      _count: { select: { enrollments: true, sections: true } },
    },
  })

  if (!course || course.instructorId !== instructor.id) {
    return Response.json({ error: "Course not found" }, { status: 404 })
  }

  return Response.json({ course })
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, instructorId: true, status: true },
  })
  if (!course || course.instructorId !== instructor.id) {
    return Response.json({ error: "Course not found" }, { status: 404 })
  }

  const { action, ...fields } = parsed.data
  const updateData: Record<string, unknown> = {}
  if (fields.title !== undefined) updateData.title = fields.title
  if (fields.description !== undefined) updateData.description = fields.description
  if (fields.price !== undefined) updateData.price = fields.price
  if (fields.categoryId !== undefined) updateData.categoryId = fields.categoryId

  if (action === "submit") {
    if (course.status !== "draft" && course.status !== "rejected") {
      return Response.json(
        { error: "Only draft or rejected courses can be submitted for approval." },
        { status: 400 }
      )
    }
    // Resubmitting clears the previous rejection note and always re-enters
    // the admin review queue as "pending" — instructors can never set
    // "approved" themselves.
    updateData.status = "pending"
    updateData.moderationNote = null
  }

  const updated = await prisma.course.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, sections: true } },
    },
  })

  return Response.json({ success: true, course: updated })
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await context.params

  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, instructorId: true, status: true },
  })
  if (!course || course.instructorId !== instructor.id) {
    return Response.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.status !== "draft") {
    return Response.json({ error: "Only draft courses can be deleted." }, { status: 400 })
  }

  await prisma.course.delete({ where: { id } })
  return Response.json({ success: true })
}
