import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

const UpdateHomeworkSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).nullable().optional(),
  dueAt: z.string().datetime().optional(),
})

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const { id } = await context.params

  const assignment = await prisma.homeworkAssignment.findUnique({
    where: { id },
    include: {
      subjectPackage: { select: { id: true, title: true } },
      submissions: {
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
      },
    },
  })

  if (!assignment || assignment.teacherId !== auth.user.id) {
    return Response.json({ error: "Homework assignment not found" }, { status: 404 })
  }

  return Response.json({ assignment })
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const { id } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = UpdateHomeworkSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const assignment = await prisma.homeworkAssignment.findUnique({
    where: { id },
    select: { id: true, teacherId: true },
  })
  if (!assignment || assignment.teacherId !== auth.user.id) {
    return Response.json({ error: "Homework assignment not found" }, { status: 404 })
  }

  const { dueAt, ...rest } = parsed.data
  const updated = await prisma.homeworkAssignment.update({
    where: { id },
    data: {
      ...rest,
      ...(dueAt ? { dueAt: new Date(dueAt) } : {}),
    },
    include: {
      subjectPackage: { select: { id: true, title: true } },
    },
  })

  return Response.json({ success: true, assignment: updated })
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const { id } = await context.params

  const assignment = await prisma.homeworkAssignment.findUnique({
    where: { id },
    select: { id: true, teacherId: true },
  })
  if (!assignment || assignment.teacherId !== auth.user.id) {
    return Response.json({ error: "Homework assignment not found" }, { status: 404 })
  }

  await prisma.homeworkSubmission.deleteMany({ where: { assignmentId: id } })
  await prisma.homeworkAssignment.delete({ where: { id } })
  return Response.json({ success: true })
}
