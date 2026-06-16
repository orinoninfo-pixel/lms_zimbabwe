import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const CreateCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
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
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "instructor") return Response.json({ error: "Forbidden" }, { status: 403 })

  const instructor = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } })
  if (!instructor || instructor.role !== "instructor") {
    return Response.json({ error: "Invalid session" }, { status: 401 })
  }

  const courses = await prisma.course.findMany({
    where: { instructorId: instructor.id },
    include: {
      _count: { select: { enrollments: true, sections: true } },
    },
    orderBy: { title: "asc" },
  })

  return Response.json({
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      price: c.price,
      students: c._count.enrollments,
      sections: c._count.sections,
      status: "Published",
      rating: 0,
      reviews: 0,
      earnings: c._count.enrollments * c.price,
      lastUpdated: "N/A",
    })),
  })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "instructor") return Response.json({ error: "Forbidden" }, { status: 403 })

  const instructor = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } })
  if (!instructor || instructor.role !== "instructor") {
    return Response.json({ error: "Invalid session" }, { status: 401 })
  }

  const json = await req.json().catch(() => null)
  const parsed = CreateCourseSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { title, description, price, sections } = parsed.data

  const placeholderVideo = "https://www.w3schools.com/html/mov_bbb.mp4"

  const created = await prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        title,
        description,
        price,
        instructorId: instructor.id,
      },
    })

    if (sections?.length) {
      for (const sectionInput of sections) {
        const section = await tx.section.create({
          data: {
            title: sectionInput.title,
            courseId: course.id,
          },
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

