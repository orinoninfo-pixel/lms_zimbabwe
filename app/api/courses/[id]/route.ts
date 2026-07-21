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
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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

      // Owner/admin preview of an unapproved course — never cache or share
      // this response, it must not leak to other visitors via a shared cache.
      return Response.json(
        { ...course, thumbnail: "/placeholder.jpg" },
        { headers: { "Cache-Control": "private, no-store" } }
      )
    }

    return Response.json(
      { ...course, thumbnail: "/placeholder.jpg" },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch course"
    return Response.json({ error: message }, { status: 500 })
  }
}
