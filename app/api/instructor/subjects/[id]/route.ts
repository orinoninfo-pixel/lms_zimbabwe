import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const UpdateSubjectSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  subject: z.string().trim().min(1).optional(),
  grade: z.number().int().min(1).max(12).optional(),
  term: z.number().int().min(1).max(4).nullable().optional(),
  price: z.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  isCapsAligned: z.boolean().optional(),
  includesLiveLessons: z.boolean().optional(),
  isExamPrep: z.boolean().optional(),
  isHolidayLearning: z.boolean().optional(),
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

  const subject = await prisma.subjectPackage.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, liveLessons: true } },
    },
  })

  if (!subject || subject.teacherId !== instructor.id) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }

  return Response.json({ subject })
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = UpdateSubjectSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const subject = await prisma.subjectPackage.findUnique({
    where: { id },
    select: { id: true, teacherId: true },
  })
  if (!subject || subject.teacherId !== instructor.id) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }

  const updated = await prisma.subjectPackage.update({
    where: { id },
    data: parsed.data,
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, liveLessons: true } },
    },
  })

  return Response.json({ success: true, subject: updated })
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await context.params

  const subject = await prisma.subjectPackage.findUnique({
    where: { id },
    select: { id: true, teacherId: true, _count: { select: { enrollments: true } } },
  })
  if (!subject || subject.teacherId !== instructor.id) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }
  if (subject._count.enrollments > 0) {
    return Response.json({ error: "This subject has enrolled students and can no longer be deleted." }, { status: 400 })
  }

  await prisma.subjectPackage.delete({ where: { id } })
  return Response.json({ success: true })
}
