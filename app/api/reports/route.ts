import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const CreateSchema = z.object({
  type: z.enum(["course_complaint", "user_report"]),
  courseId: z.string().uuid().optional(),
  accusedUserId: z.string().uuid().optional(),
  message: z.string().min(10).max(1000),
})

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const reporterId = session.userId
  const { type, courseId, accusedUserId, message } = parsed.data

  if (type === "course_complaint") {
    if (!courseId) return Response.json({ error: "courseId is required" }, { status: 400 })

    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) return Response.json({ error: "Course not found" }, { status: 404 })

    if (session.role === "student") {
      const enrolled = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: reporterId, courseId } },
        select: { id: true },
      })
      if (!enrolled) return Response.json({ error: "Only enrolled students can report this course" }, { status: 403 })
    }
  }

  if (type === "user_report") {
    if (!accusedUserId) return Response.json({ error: "accusedUserId is required" }, { status: 400 })
    if (accusedUserId === reporterId) return Response.json({ error: "You cannot report yourself" }, { status: 400 })
  }

  const created = await prisma.report.create({
    data: {
      type,
      reporterId,
      courseId: type === "course_complaint" ? (courseId ?? null) : null,
      accusedUserId: type === "user_report" ? (accusedUserId ?? null) : null,
      message,
      status: "open",
    },
  })

  return Response.json({ success: true, report: created })
}
