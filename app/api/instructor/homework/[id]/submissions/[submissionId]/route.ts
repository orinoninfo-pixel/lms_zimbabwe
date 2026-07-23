import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const GradeSubmissionSchema = z.object({
  feedback: z.string().trim().min(1).nullable().optional(),
  status: z.enum(["submitted", "graded"]).optional(),
})

async function requireInstructor() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== "instructor") return null

  const instructor = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } })
  if (!instructor || instructor.role !== "instructor") return null
  return instructor
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; submissionId: string }> }
) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id, submissionId } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = GradeSubmissionSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const assignment = await prisma.homeworkAssignment.findUnique({
    where: { id },
    select: { id: true, teacherId: true },
  })
  if (!assignment || assignment.teacherId !== instructor.id) {
    return Response.json({ error: "Homework assignment not found" }, { status: 404 })
  }

  const submission = await prisma.homeworkSubmission.findUnique({
    where: { id: submissionId },
    select: { id: true, assignmentId: true },
  })
  if (!submission || submission.assignmentId !== id) {
    return Response.json({ error: "Submission not found" }, { status: 404 })
  }

  const updated = await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: {
      ...(parsed.data.feedback !== undefined ? { feedback: parsed.data.feedback } : {}),
      status: parsed.data.status ?? "graded",
    },
    include: { student: { select: { id: true, name: true, email: true } } },
  })

  return Response.json({ success: true, submission: updated })
}
