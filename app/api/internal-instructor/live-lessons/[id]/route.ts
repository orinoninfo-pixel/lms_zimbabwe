import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

const UpdateLiveLessonSchema = z.object({
  title: z.string().trim().min(1).optional(),
  startsAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  meetingLink: z.string().trim().url().nullable().optional(),
  recordingUrl: z.string().trim().url().nullable().optional(),
  status: z.enum(["upcoming", "completed", "canceled"]).optional(),
})

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const { id } = await context.params

  const lesson = await prisma.liveLesson.findUnique({
    where: { id },
    include: {
      subjectPackage: { select: { id: true, title: true } },
      course: { select: { id: true, title: true } },
      _count: { select: { attendance: true } },
    },
  })

  if (!lesson || lesson.teacherId !== auth.user.id) {
    return Response.json({ error: "Live lesson not found" }, { status: 404 })
  }

  return Response.json({ lesson })
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const { id } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = UpdateLiveLessonSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const lesson = await prisma.liveLesson.findUnique({
    where: { id },
    select: { id: true, teacherId: true },
  })
  if (!lesson || lesson.teacherId !== auth.user.id) {
    return Response.json({ error: "Live lesson not found" }, { status: 404 })
  }

  const { startsAt, ...rest } = parsed.data
  const updated = await prisma.liveLesson.update({
    where: { id },
    data: {
      ...rest,
      ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
    },
    include: {
      subjectPackage: { select: { id: true, title: true } },
      course: { select: { id: true, title: true } },
    },
  })

  return Response.json({ success: true, lesson: updated })
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const { id } = await context.params

  const lesson = await prisma.liveLesson.findUnique({
    where: { id },
    select: { id: true, teacherId: true },
  })
  if (!lesson || lesson.teacherId !== auth.user.id) {
    return Response.json({ error: "Live lesson not found" }, { status: 404 })
  }

  await prisma.attendance.deleteMany({ where: { liveLessonId: id } })
  await prisma.liveLesson.delete({ where: { id } })
  return Response.json({ success: true })
}
