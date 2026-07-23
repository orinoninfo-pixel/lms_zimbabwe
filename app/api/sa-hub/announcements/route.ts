import { z } from "zod"
import { prisma } from "@/lib/prisma"

const QuerySchema = z.object({
  grade: z.coerce.number().int().min(1).max(13).optional(),
  subject: z.string().optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    grade: url.searchParams.get("grade") ?? undefined,
    subject: url.searchParams.get("subject") ?? undefined,
  })
  if (!parsed.success) return Response.json({ error: "Invalid query" }, { status: 400 })

  const where: Record<string, unknown> = {}
  if (parsed.data.grade) where.grade = parsed.data.grade
  if (parsed.data.subject) where.subject = { contains: parsed.data.subject.trim(), mode: "insensitive" }

  const announcements = await prisma.announcement.findMany({
    where,
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return Response.json({ announcements })
}
