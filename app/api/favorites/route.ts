import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const BodySchema = z.object({
  courseId: z.string().min(1),
})

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "student") return Response.json({ error: "Only students can view wishlist" }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student") return Response.json({ error: "Invalid session" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Account disabled" }, { status: 403 })

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const courseIds = favorites.map((f) => f.courseId)
  const enrolled = await prisma.enrollment.findMany({
    where: { userId: user.id, courseId: { in: courseIds } },
    select: { courseId: true },
  })
  const enrolledSet = new Set(enrolled.map((e) => e.courseId))

  return Response.json({
    courses: favorites
      .filter((f) => f.course.status === "approved")
      .map((f) => ({
        id: f.course.id,
        title: f.course.title,
        description: f.course.description,
        price: f.course.price,
        instructorName: f.course.instructor.name,
        thumbnail: "/placeholder.jpg",
        favoritedAt: f.createdAt,
        enrolled: enrolledSet.has(f.courseId),
      })),
  })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }
  if (session.role !== "student") {
    return Response.json({ error: "Only students can favorite courses" }, { status: 403 })
  }

  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true, status: true } })
  if (!user || user.role !== "student") {
    return Response.json({ error: "Invalid session" }, { status: 401 })
  }
  if (user.status !== "active") {
    return Response.json({ error: "Account disabled" }, { status: 403 })
  }

  const courseId = parsed.data.courseId
  const courseExists = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
  if (!courseExists) {
    return Response.json({ error: "Course not found" }, { status: 404 })
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return Response.json({ success: true, favorited: false })
  }

  await prisma.favorite.create({ data: { userId: user.id, courseId } })
  return Response.json({ success: true, favorited: true })
}
