import { z } from "zod"
import { prisma } from "@/lib/prisma"

const QuerySchema = z.object({
  grade: z.coerce.number().int().min(1).max(12).optional(),
  subject: z.string().optional(),
  kind: z.enum(["notes", "study_resource", "worksheet", "recording"]).optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    grade: url.searchParams.get("grade") ?? undefined,
    subject: url.searchParams.get("subject") ?? undefined,
    kind: url.searchParams.get("kind") ?? undefined,
  })
  if (!parsed.success) return Response.json({ error: "Invalid query" }, { status: 400 })

  const where: Record<string, unknown> = {}
  if (parsed.data.grade) where.grade = parsed.data.grade
  if (parsed.data.subject) where.subject = { contains: parsed.data.subject.trim(), mode: "insensitive" }
  if (parsed.data.kind) where.kind = parsed.data.kind

  const resources = await prisma.learningResource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return Response.json({ resources })
}
