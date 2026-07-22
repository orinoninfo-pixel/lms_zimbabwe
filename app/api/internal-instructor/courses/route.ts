import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireInternalInstructor } from "@/lib/rbac"

const CreateCourseSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number().int().nonnegative(),
  categoryId: z.string().uuid().nullable().optional(),
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

export async function GET() {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const courses = await prisma.course.findMany({
    where: { instructorId: auth.user.id },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, sections: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return Response.json({ courses })
}

export async function POST(req: Request) {
  const auth = await requireInternalInstructor()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = CreateCourseSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { title, description, price, categoryId, sections } = parsed.data
  const placeholderVideo = "https://www.w3schools.com/html/mov_bbb.mp4"

  const created = await prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        title,
        description,
        price,
        categoryId: categoryId ?? null,
        instructorId: auth.user.id,
        status: "draft",
      },
    })

    if (sections?.length) {
      for (const sectionInput of sections) {
        const section = await tx.section.create({
          data: { title: sectionInput.title, courseId: course.id },
        })

        if (sectionInput.lessons?.length) {
          await tx.lesson.createMany({
            data: sectionInput.lessons.map((l) => ({
              title: l.title,
              videoUrl: l.videoUrl ?? placeholderVideo,
              sectionId: section.id,
            })),
          })
        }
      }
    }

    return course
  })

  return Response.json({ success: true, courseId: created.id })
}
