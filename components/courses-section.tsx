import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/shared/course-card"
import { prisma } from "@/lib/prisma"

export async function CoursesSection() {
  // Query Prisma directly instead of self-fetching /api/courses: calling
  // headers() to build that request's URL forced the whole homepage into
  // dynamic (per-request) rendering, which defeats ISR for the most-visited
  // page on the site.
  const courses = await prisma.course.findMany({
    where: { status: "approved" },
    include: { instructor: { select: { name: true } } },
    orderBy: { title: "asc" },
  }).then((rows) =>
    rows.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail: "/placeholder.jpg",
      instructorName: course.instructor.name,
    }))
  ).catch(() => [])

  if (!courses || courses.length === 0) {
    return (
      <section id="courses" className="bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Featured Courses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">No courses available right now.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="courses" className="bg-muted/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Featured Courses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hand-picked courses to help you get started
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              price={course.price}
              instructorName={course.instructorName}
              thumbnail={course.thumbnail}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
