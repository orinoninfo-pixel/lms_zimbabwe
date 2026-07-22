import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

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

export async function GET() {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const subjects = await prisma.subjectPackage.findMany({
    where: { teacherId: auth.user.id },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, liveLessons: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return Response.json({ subjects })
}

export async function POST(req: Request) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

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
      teacherId: auth.user.id,
      isCapsAligned: flags.isCapsAligned ?? true,
      includesLiveLessons: flags.includesLiveLessons ?? true,
      isExamPrep: flags.isExamPrep ?? false,
      isHolidayLearning: flags.isHolidayLearning ?? false,
    },
  })

  return Response.json({ success: true, subjectId: created.id })
}
