import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseCard } from "@/components/shared/course-card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

// Public, non-personalized listing (Navbar hydrates session client-side) —
// ISR instead of force-dynamic so this doesn't hit Postgres on every request.
export const revalidate = 120

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "approved" },
    include: { instructor: { select: { name: true } } },
    orderBy: { title: "asc" },
    take: 500,
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Courses</h1>
                <p className="mt-2 text-muted-foreground">Browse all available courses</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            {courses.length === 0 ? (
              <div className="mt-8 rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">No courses available right now.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    price={course.price}
                    instructorName={course.instructor.name}
                    thumbnail="/placeholder.jpg"
                    titleHoverClassName="group-hover:text-primary"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
