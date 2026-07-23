import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

const CreateHomeworkSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  dueAt: z.string().datetime(),
  subjectPackageId: z.string().uuid(),
})

export async function GET() {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const assignments = await prisma.homeworkAssignment.findMany({
    where: { teacherId: auth.user.id },
    include: {
      subjectPackage: { select: { id: true, title: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { dueAt: "desc" },
    take: 200,
  })

  return Response.json({ assignments })
}

export async function POST(req: Request) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = CreateHomeworkSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { title, description, dueAt, subjectPackageId } = parsed.data

  const pkg = await prisma.subjectPackage.findUnique({
    where: { id: subjectPackageId },
    select: { id: true, teacherId: true, subject: true, grade: true },
  })
  if (!pkg || pkg.teacherId !== auth.user.id) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }

  const created = await prisma.homeworkAssignment.create({
    data: {
      title,
      description: description ?? null,
      subject: pkg.subject,
      grade: pkg.grade,
      dueAt: new Date(dueAt),
      teacherId: auth.user.id,
      subjectPackageId: pkg.id,
    },
  })

  return Response.json({ success: true, assignmentId: created.id })
}
