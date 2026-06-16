import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        sections: {
          orderBy: [{ order: "asc" }, { title: "asc" }],
          include: { lessons: { orderBy: [{ order: "asc" }, { title: "asc" }] } },
        },
      },
    })

    if (!course) {
      return new Response("Not found", { status: 404 })
    }

    if (course.status !== "approved") {
      const session = await getSession()
      const canView =
        session?.role === "admin" || (session?.role === "instructor" && session.userId === course.instructorId)
      if (!canView) return new Response("Not found", { status: 404 })
    }

    return Response.json({
      ...course,
      thumbnail: "/placeholder.jpg",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch course"
    return Response.json({ error: message }, { status: 500 })
  }
}
