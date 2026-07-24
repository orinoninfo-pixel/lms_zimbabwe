import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { THUMBNAIL_BLUR_DATA_URL } from "@/lib/utils"

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
            <article
              key={course.id}
              className="group overflow-hidden rounded-lg border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
            >
              <Link href={`/course/${course.id}`} className="block">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    placeholder="blur"
                    blurDataURL={THUMBNAIL_BLUR_DATA_URL}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-5">
                <Link href={`/course/${course.id}`}>
                  <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {course.title}
                  </h3>
                </Link>
                <p className="mt-1.5 text-sm text-muted-foreground">by {course.instructorName}</p>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-foreground">${course.price}</span>
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/course/${course.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
