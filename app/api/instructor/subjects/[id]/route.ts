import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const SectionInputSchema = z.object({
  title: z.string().min(1),
  lessons: z.array(
    z.object({
      title: z.string().min(1),
      videoUrl: z.string().url().optional(),
    })
  ),
})

const placeholderVideo = "https://www.w3schools.com/html/mov_bbb.mp4"

const UpdateSubjectSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  subject: z.string().trim().min(1).optional(),
  grade: z.number().int().min(1).max(13).optional(),
  term: z.number().int().min(1).max(4).nullable().optional(),
  price: z.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  isCapsAligned: z.boolean().optional(),
  examiningBody: z.enum(["zimsec", "cambridge"]).optional(),
  includesLiveLessons: z.boolean().optional(),
  isExamPrep: z.boolean().optional(),
  isHolidayLearning: z.boolean().optional(),
  sections: z.array(SectionInputSchema).optional(),
  action: z.enum(["submit"]).optional(),
})

const curriculumInclude = {
  category: { select: { id: true, name: true } },
  _count: { select: { enrollments: true, liveLessons: true } },
  sections: {
    orderBy: [{ order: "asc" as const }, { title: "asc" as const }],
    include: {
      lessons: {
        orderBy: [{ order: "asc" as const }, { title: "asc" as const }],
        select: { id: true, title: true, videoUrl: true, order: true },
      },
    },
  },
}

async function requireInstructor() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== "instructor") return null

  const instructor = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } })
  if (!instructor || instructor.role !== "instructor") return null
  return instructor
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await context.params

  const subject = await prisma.subjectPackage.findUnique({
    where: { id },
    include: curriculumInclude,
  })

  if (!subject || subject.teacherId !== instructor.id) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }

  return Response.json({ subject })
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await context.params
  const json = await req.json().catch(() => null)
  const parsed = UpdateSubjectSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const subject = await prisma.subjectPackage.findUnique({
    where: { id },
    select: { id: true, teacherId: true, status: true, _count: { select: { enrollments: true } } },
  })
  if (!subject || subject.teacherId !== instructor.id) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }

  const { sections, action, ...fields } = parsed.data

  if (sections !== undefined && subject._count.enrollments > 0) {
    return Response.json(
      { error: "This subject already has enrolled students, so its curriculum can no longer be replaced." },
      { status: 400 }
    )
  }

  if (action === "submit" && subject.status !== "draft" && subject.status !== "rejected") {
    return Response.json(
      { error: "Only draft or rejected subjects can be submitted for approval." },
      { status: 400 }
    )
  }

  // Resubmitting clears the previous rejection note and always re-enters the
  // admin review queue as "pending" — tutors can never set "approved" themselves.
  const updateData = {
    ...fields,
    ...(action === "submit" ? { status: "pending" as const, moderationNote: null } : {}),
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (sections !== undefined) {
        await tx.subjectLessonProgress.deleteMany({ where: { lesson: { section: { subjectPackageId: id } } } })
        await tx.subjectLesson.deleteMany({ where: { section: { subjectPackageId: id } } })
        await tx.subjectSection.deleteMany({ where: { subjectPackageId: id } })

        for (const [sectionIndex, sectionInput] of sections.entries()) {
          const section = await tx.subjectSection.create({
            data: { title: sectionInput.title, subjectPackageId: id, order: sectionIndex },
          })

          if (sectionInput.lessons.length) {
            await tx.subjectLesson.createMany({
              data: sectionInput.lessons.map((l, lessonIndex) => ({
                title: l.title,
                videoUrl: l.videoUrl ?? placeholderVideo,
                sectionId: section.id,
                order: lessonIndex,
              })),
            })
          }
        }
      }

      return tx.subjectPackage.update({
        where: { id },
        data: updateData,
        include: curriculumInclude,
      })
    })

    return Response.json({ success: true, subject: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save subject"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const instructor = await requireInstructor()
  if (!instructor) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await context.params

  const subject = await prisma.subjectPackage.findUnique({
    where: { id },
    select: { id: true, teacherId: true, _count: { select: { enrollments: true } } },
  })
  if (!subject || subject.teacherId !== instructor.id) {
    return Response.json({ error: "Subject not found" }, { status: 404 })
  }
  if (subject._count.enrollments > 0) {
    return Response.json({ error: "This subject has enrolled students and can no longer be deleted." }, { status: 400 })
  }

  await prisma.subjectPackage.delete({ where: { id } })
  return Response.json({ success: true })
}
