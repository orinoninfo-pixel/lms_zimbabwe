import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const CreateCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  categoryId: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "pending"]).default("pending"),
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
    orderBy: { updatedAt: "desc" },
  })

  const payoutTotals = await prisma.transaction.groupBy({
    by: ["courseId"],
    where: {
      type: "payout",
      userId: instructor.id,
      status: { in: ["succeeded", "pending"] },
      courseId: { in: courses.map((c) => c.id) },
    },
    _sum: { amount: true },
  })
  const earningsByCourseId = new Map(payoutTotals.map((row) => [row.courseId, row._sum.amount ?? 0]))

  const statusLabel: Record<string, "Published" | "Draft" | "Under Review" | "Rejected" | "Suspended"> = {
    approved: "Published",
    draft: "Draft",
    pending: "Under Review",
    rejected: "Rejected",
    suspended: "Suspended",
  }

  return Response.json({
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      price: c.price,
      students: c._count.enrollments,
      sections: c._count.sections,
      status: statusLabel[c.status] ?? "Draft",
      rawStatus: c.status,
      moderationNote: c.moderationNote,
      rating: 0,
      reviews: 0,
      earnings: earningsByCourseId.get(c.id) ?? 0,
      lastUpdated: c.updatedAt.toLocaleDateString("en-ZW", { year: "numeric", month: "short", day: "numeric" }),
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

  const { title, description, price, categoryId, status, sections } = parsed.data

  const placeholderVideo = "https://www.w3schools.com/html/mov_bbb.mp4"

  const created = await prisma.$transaction(async (tx) => {
    // Instructor-submitted courses always start as draft/pending — only an
    // admin approval (see /api/admin/courses) can ever make a course "approved"
    // and therefore purchasable/visible to students.
    const course = await tx.course.create({
      data: {
        title,
        description,
        price,
        categoryId: categoryId ?? null,
        instructorId: instructor.id,
        status,
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

  return Response.json({ success: true, courseId: created.id, status: created.status })
}
