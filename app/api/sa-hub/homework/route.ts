import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const GradeSchema = z.coerce.number().int().min(1).max(13)

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "student") return Response.json({ error: "Forbidden" }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student") return Response.json({ error: "Invalid session" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Account disabled" }, { status: 403 })

  const url = new URL(req.url)
  const grade = url.searchParams.get("grade")
  const subject = url.searchParams.get("subject")?.trim()

  const where: Record<string, unknown> = {}
  if (grade) {
    const parsed = GradeSchema.safeParse(grade)
    if (parsed.success) where.grade = parsed.data
  }
  if (subject) where.subject = { contains: subject, mode: "insensitive" }

  const assignments = await prisma.homeworkAssignment.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      submissions: { where: { studentId: user.id }, take: 1 },
    },
    orderBy: { dueAt: "asc" },
    take: 100,
  })

  return Response.json({
    assignments: assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      subject: a.subject,
      grade: a.grade,
      dueAt: a.dueAt,
      teacher: a.teacher,
      submission: a.submissions[0]
        ? {
            id: a.submissions[0].id,
            status: a.submissions[0].status,
            submittedAt: a.submissions[0].submittedAt,
            feedback: a.submissions[0].feedback,
          }
        : null,
    })),
  })
}

const SubmitSchema = z.object({
  assignmentId: z.string().uuid(),
  answerText: z.string().min(1).max(5000).optional(),
  fileUrl: z.string().url().optional(),
})

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "student") return Response.json({ error: "Forbidden" }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student") return Response.json({ error: "Invalid session" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Account disabled" }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = SubmitSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const assignment = await prisma.homeworkAssignment.findUnique({
    where: { id: parsed.data.assignmentId },
    select: { id: true },
  })
  if (!assignment) return Response.json({ error: "Assignment not found" }, { status: 404 })

  const submission = await prisma.homeworkSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId: parsed.data.assignmentId, studentId: user.id } },
    update: {
      status: "submitted",
      answerText: parsed.data.answerText ?? undefined,
      fileUrl: parsed.data.fileUrl ?? undefined,
      submittedAt: new Date(),
    },
    create: {
      assignmentId: parsed.data.assignmentId,
      studentId: user.id,
      status: "submitted",
      answerText: parsed.data.answerText ?? null,
      fileUrl: parsed.data.fileUrl ?? null,
      submittedAt: new Date(),
    },
    select: { id: true, status: true, submittedAt: true },
  })

  return Response.json({ success: true, submission })
}
