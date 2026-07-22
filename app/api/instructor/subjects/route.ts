import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const CreateSubjectSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  grade: z.number().int().min(1).max(12),
  term: z.number().int().min(1).max(4).nullable().optional(),
  price: z.number().int().nonnegative(),
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

export async function GET() {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const subjects = await prisma.subjectPackage.findMany({
    where: { teacherId: instructor.id },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, liveLessons: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return Response.json({ subjects })
}

export async function POST(req: Request) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = CreateSubjectSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { title, description, subject, grade, term, price, categoryId, ...flags } = parsed.data

  const created = await prisma.subjectPackage.create({
    data: {
      title,
      description,
      subject,
      grade,
      term: term ?? null,
      price,
      currency: "USD",
      billingPeriod: "monthly",
      categoryId: categoryId ?? null,
      teacherId: instructor.id,
      isCapsAligned: flags.isCapsAligned ?? true,
      includesLiveLessons: flags.includesLiveLessons ?? true,
      isExamPrep: flags.isExamPrep ?? false,
      isHolidayLearning: flags.isHolidayLearning ?? false,
    },
  })

  return Response.json({ success: true, subjectId: created.id })
}
