import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

const CreateLiveLessonSchema = z
  .object({
    title: z.string().trim().min(1),
    startsAt: z.string().datetime(),
    durationMinutes: z.number().int().min(5).max(480),
    meetingLink: z.string().trim().url().optional(),
    subjectPackageId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
  })
  .refine((data) => Boolean(data.subjectPackageId) !== Boolean(data.courseId), {
    message: "Link the live lesson to exactly one subject or one course.",
  })

export async function GET(req: Request) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const subjectPackageId = url.searchParams.get("subjectPackageId")
  const courseId = url.searchParams.get("courseId")

  const where: Record<string, unknown> = { teacherId: auth.user.id }
  if (subjectPackageId) where.subjectPackageId = subjectPackageId
  if (courseId) where.courseId = courseId

  const lessons = await prisma.liveLesson.findMany({
    where,
    include: {
      subjectPackage: { select: { id: true, title: true } },
      course: { select: { id: true, title: true } },
      _count: { select: { attendance: true } },
    },
    orderBy: { startsAt: "desc" },
    take: 200,
  })

  return Response.json({ lessons })
}

export async function POST(req: Request) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = CreateLiveLessonSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 })
  }

  const { title, startsAt, durationMinutes, meetingLink, subjectPackageId, courseId } = parsed.data

  let subject: string
  let grade: number | null = null
  let categoryId: string | null = null

  if (subjectPackageId) {
    const pkg = await prisma.subjectPackage.findUnique({
      where: { id: subjectPackageId },
      select: { id: true, teacherId: true, subject: true, grade: true, categoryId: true },
    })
    if (!pkg || pkg.teacherId !== auth.user.id) {
      return Response.json({ error: "Subject not found" }, { status: 404 })
    }
    subject = pkg.subject
    grade = pkg.grade
    categoryId = pkg.categoryId
  } else {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true, title: true, categoryId: true },
    })
    if (!course || course.instructorId !== auth.user.id) {
      return Response.json({ error: "Course not found" }, { status: 404 })
    }
    subject = course.title
    categoryId = course.categoryId
  }

  const created = await prisma.liveLesson.create({
    data: {
      title,
      subject,
      grade,
      categoryId,
      startsAt: new Date(startsAt),
      durationMinutes,
      meetingLink: meetingLink ?? null,
      teacherId: auth.user.id,
      subjectPackageId: subjectPackageId ?? null,
      courseId: courseId ?? null,
    },
  })

  return Response.json({ success: true, lessonId: created.id })
}
