import { z } from "zod"
import { prisma } from "@/lib/prisma"

const QuerySchema = z.object({
  subject: z.string().optional(),
  grade: z.coerce.number().int().min(1).max(13).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  examType: z.string().optional(),
  kind: z.enum(["paper", "memo"]).optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    subject: url.searchParams.get("subject") ?? undefined,
    grade: url.searchParams.get("grade") ?? undefined,
    year: url.searchParams.get("year") ?? undefined,
    term: url.searchParams.get("term") ?? undefined,
    examType: url.searchParams.get("examType") ?? undefined,
    kind: url.searchParams.get("kind") ?? undefined,
  })
  if (!parsed.success) return Response.json({ error: "Invalid query" }, { status: 400 })

  const where: Record<string, unknown> = {}
  if (parsed.data.subject) where.subject = { contains: parsed.data.subject.trim(), mode: "insensitive" }
  if (parsed.data.grade) where.grade = parsed.data.grade
  if (parsed.data.year) where.year = parsed.data.year
  if (parsed.data.term) where.term = parsed.data.term
  if (parsed.data.examType) where.examType = { contains: parsed.data.examType.trim(), mode: "insensitive" }
  if (parsed.data.kind) where.kind = parsed.data.kind

  const resources = await prisma.examResource.findMany({
    where,
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    take: 200,
  })

  return Response.json({ resources })
}
