import { prisma } from "@/lib/prisma"

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { status: "approved" },
    include: { instructor: { select: { name: true } } },
    orderBy: { title: "asc" },
  })

  return Response.json(
    courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      instructorId: course.instructorId,
      thumbnail: "/placeholder.jpg",
      instructorName: course.instructor.name,
    })),
    {
      // Public, identical for every visitor — safe to cache at the CDN edge.
      // 2 min fresh + 5 min stale-while-revalidate means most browsing on a
      // mobile bundle never re-hits the database.
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
    }
  )
}
