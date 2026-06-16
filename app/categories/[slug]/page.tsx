import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  })
  if (!category) notFound()

  const courses = await prisma.course.findMany({
    where: { status: "approved", categoryId: category.id },
    include: { instructor: { select: { name: true } } },
    orderBy: { title: "asc" },
    take: 200,
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{category.name}</h1>
                <p className="mt-2 text-muted-foreground">Browse courses in {category.name}</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/categories">Back to Categories</Link>
              </Button>
            </div>

            {courses.length === 0 ? (
              <div className="mt-8 rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">No courses available in this category yet.</p>
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/courses">Browse all courses</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <article
                    key={course.id}
                    className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-lg hover:border-muted-foreground/20 transition-all duration-300"
                  >
                    <Link href={`/course/${course.id}`} className="block">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src="/placeholder.jpg"
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
                      <p className="mt-1.5 text-sm text-muted-foreground">by {course.instructor.name}</p>
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-semibold text-foreground">{formatUsd(course.price)}</span>
                        </div>
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/course/${course.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </article>
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
