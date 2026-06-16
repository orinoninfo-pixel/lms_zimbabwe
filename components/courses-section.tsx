import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { headers } from "next/headers"

type ApiCourse = {
  id: string
  title: string
  description: string
  price: number
  thumbnail: string
  instructorName: string
}

export async function CoursesSection() {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  const baseUrl = host ? `${proto}://${host}` : ""

  const courses: ApiCourse[] = await fetch(`${baseUrl}/api/courses`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [])

  if (!courses || courses.length === 0) {
    return (
      <section id="courses" className="py-20 md:py-28 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
              Featured Courses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">No courses available right now.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="courses" className="py-20 md:py-28 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
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
              className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-lg hover:border-muted-foreground/20 transition-all duration-300"
            >
              <Link href={`/course/${course.id}`} className="block">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-5">
                <Link href={`/course/${course.id}`}>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
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
