import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

const CreateSubjectSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  grade: z.number().int().min(1).max(13),
  term: z.number().int().min(1).max(4).nullable().optional(),
  price: z.number().int().nonnegative(),
  categoryId: z.string().uuid().nullable().optional(),
  isCapsAligned: z.boolean().optional(),
  examiningBody: z.enum(["zimsec", "cambridge"]).optional(),
  includesLiveLessons: z.boolean().optional(),
  isExamPrep: z.boolean().optional(),
  isHolidayLearning: z.boolean().optional(),
  sections: z
    .array(
      z.object({
        title: z.string().min(1),
        lessons: z.array(
          z.object({
            title: z.string().min(1),
            videoUrl: z.string().url().optional(),
          })
        ),
      })
    )
    .optional(),
})

const placeholderVideo = "https://www.w3schools.com/html/mov_bbb.mp4"

export async function GET() {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const subjects = await prisma.subjectPackage.findMany({
    where: { teacherId: auth.user.id },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, liveLessons: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return Response.json({ subjects })
}

export async function POST(req: Request) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = CreateSubjectSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { title, description, subject, grade, term, price, categoryId, sections, ...flags } = parsed.data

  try {
    const created = await prisma.$transaction(async (tx) => {
      const subjectPackage = await tx.subjectPackage.create({
        data: {
          title,
          description,
          subject,
          grade,
          term: term ?? null,
          price,
          currency: "USD",
          billingPeriod: "monthly",
          categoryId: categoryId ?? null,
          teacherId: auth.user.id,
          isCapsAligned: flags.isCapsAligned ?? true,
          examiningBody: flags.examiningBody ?? "zimsec",
          includesLiveLessons: flags.includesLiveLessons ?? true,
          isExamPrep: flags.isExamPrep ?? false,
          isHolidayLearning: flags.isHolidayLearning ?? false,
          // New subjects always start as a draft — only an admin approval
          // (see /api/admin/subjects) can make one "approved" and therefore
          // visible/enrollable by students.
          status: "draft",
        },
      })

      if (sections?.length) {
        for (const [sectionIndex, sectionInput] of sections.entries()) {
          const section = await tx.subjectSection.create({
            data: { title: sectionInput.title, subjectPackageId: subjectPackage.id, order: sectionIndex },
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

      return subjectPackage
    })

    return Response.json({ success: true, subjectId: created.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create subject"
    return Response.json({ error: message }, { status: 500 })
  }
}
