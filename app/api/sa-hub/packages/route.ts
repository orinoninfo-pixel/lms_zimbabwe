import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const QuerySchema = z.object({
  subject: z.string().optional(),
  grade: z.coerce.number().int().min(1).max(13).optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  examiningBody: z.enum(["zimsec", "cambridge"]).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  includesLiveLessons: z.coerce.boolean().optional(),
  isExamPrep: z.coerce.boolean().optional(),
  isHolidayLearning: z.coerce.boolean().optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    subject: url.searchParams.get("subject") ?? undefined,
    grade: url.searchParams.get("grade") ?? undefined,
    term: url.searchParams.get("term") ?? undefined,
    examiningBody: url.searchParams.get("examiningBody") ?? undefined,
    minPrice: url.searchParams.get("minPrice") ?? undefined,
    maxPrice: url.searchParams.get("maxPrice") ?? undefined,
    includesLiveLessons: url.searchParams.get("includesLiveLessons") ?? undefined,
    isExamPrep: url.searchParams.get("isExamPrep") ?? undefined,
    isHolidayLearning: url.searchParams.get("isHolidayLearning") ?? undefined,
  })
  if (!parsed.success) return Response.json({ error: "Invalid query" }, { status: 400 })

  const where: Record<string, unknown> = {}
  if (parsed.data.subject) where.subject = { contains: parsed.data.subject.trim(), mode: "insensitive" }
  if (parsed.data.grade) where.grade = parsed.data.grade
  if (parsed.data.term) where.term = parsed.data.term
  if (parsed.data.examiningBody) where.examiningBody = parsed.data.examiningBody
  if (typeof parsed.data.includesLiveLessons === "boolean") where.includesLiveLessons = parsed.data.includesLiveLessons
  if (typeof parsed.data.isExamPrep === "boolean") where.isExamPrep = parsed.data.isExamPrep
  if (typeof parsed.data.isHolidayLearning === "boolean") where.isHolidayLearning = parsed.data.isHolidayLearning
  if (typeof parsed.data.minPrice === "number" || typeof parsed.data.maxPrice === "number") {
    where.price = {
      ...(typeof parsed.data.minPrice === "number" ? { gte: parsed.data.minPrice } : {}),
      ...(typeof parsed.data.maxPrice === "number" ? { lte: parsed.data.maxPrice } : {}),
    }
  }

  const packages = await prisma.subjectPackage.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true } },
      _count: { select: { liveLessons: true } },
    },
    orderBy: [{ grade: "asc" }, { subject: "asc" }],
    take: 200,
  })

  const session = await getSession()
  const studentId = session?.role === "student" ? session.userId : null
  const enrollmentByPackageId = new Map<string, { status: string; endDate: string | null; price: number; billingPeriod: string }>()

  if (studentId && packages.length) {
    const ids = packages.map((p) => p.id)
    const enrollments = await prisma.subjectEnrollment.findMany({
      where: { userId: studentId, subjectPackageId: { in: ids } },
      select: { subjectPackageId: true, status: true, endDate: true, price: true, billingPeriod: true },
    })
    for (const e of enrollments) {
      enrollmentByPackageId.set(e.subjectPackageId, {
        status: e.status,
        endDate: e.endDate ? e.endDate.toISOString() : null,
        price: e.price,
        billingPeriod: e.billingPeriod,
      })
    }
  }

  return Response.json({
    packages: packages.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      subject: p.subject,
      grade: p.grade,
      term: p.term,
      price: p.price,
      currency: p.currency,
      billingPeriod: p.billingPeriod,
      isCapsAligned: p.isCapsAligned,
      examiningBody: p.examiningBody,
      includesLiveLessons: p.includesLiveLessons,
      isExamPrep: p.isExamPrep,
      isHolidayLearning: p.isHolidayLearning,
      teacherName: p.teacher?.name ?? null,
      lessonsCount: p._count.liveLessons,
      enrollment: enrollmentByPackageId.get(p.id) ?? null,
    })),
  })
}
