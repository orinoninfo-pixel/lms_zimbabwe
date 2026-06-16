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
    }))
  )
}
