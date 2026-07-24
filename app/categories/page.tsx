import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import { BookOpen, ClipboardCheck, Cpu, Map, Target, TrendingUp, Trophy, Users } from "lucide-react"

// Public, non-personalized listing (Navbar hydrates session client-side) —
// ISR instead of force-dynamic so this doesn't hit Postgres on every request.
export const revalidate = 300

type CategoryStyle = {
  icon: typeof BookOpen
  meta: string
  color: string
}

const defaultStyle: CategoryStyle = {
  icon: BookOpen,
  meta: "Browse courses",
  color: "bg-muted text-muted-foreground",
}

const styleBySlug: Record<string, CategoryStyle> = {
  "mathematical-literacy": { icon: Target, meta: "Form 3–6", color: "bg-primary/12 text-primary" },
  mathematics: { icon: Target, meta: "Form 1–6", color: "bg-primary/12 text-primary" },
  "physical-sciences": { icon: Trophy, meta: "ZIMSEC-aligned", color: "bg-accent/22 text-accent-foreground" },
  "life-sciences": { icon: Users, meta: "Form 3–6", color: "bg-secondary/20 text-secondary-foreground" },
  accounting: { icon: TrendingUp, meta: "Form 3–6", color: "bg-warning/20 text-warning-foreground" },
  "business-studies": { icon: Users, meta: "Form 3–6", color: "bg-info/20 text-info" },
  economics: { icon: TrendingUp, meta: "Form 3–6", color: "bg-success/20 text-success" },
  english: { icon: BookOpen, meta: "Language & writing", color: "bg-destructive/16 text-destructive" },
  afrikaans: { icon: BookOpen, meta: "Language & writing", color: "bg-destructive/12 text-destructive" },
  geography: { icon: Map, meta: "Maps & revision", color: "bg-info/20 text-info" },
  history: { icon: BookOpen, meta: "Essays & revision", color: "bg-primary/16 text-primary" },
  cat: { icon: Cpu, meta: "Digital skills", color: "bg-primary/12 text-primary" },
  it: { icon: Cpu, meta: "Programming basics", color: "bg-info/20 text-info" },
  "homework-help": { icon: ClipboardCheck, meta: "Step-by-step help", color: "bg-warning/20 text-warning-foreground" },
  "holiday-catch-up": { icon: Trophy, meta: "Catch up fast", color: "bg-warning/20 text-warning-foreground" },
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
    take: 200,
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Categories</h1>
              <p className="mt-2 text-muted-foreground">Browse courses by category</p>
            </div>

            {categories.length === 0 ? (
              <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">No categories yet.</p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                {categories.map((category) => {
                  const style = styleBySlug[category.slug] ?? defaultStyle
                  const Icon = style.icon
                  const meta = styleBySlug[category.slug]?.meta ?? defaultStyle.meta

                  return (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="group flex flex-col items-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-muted-foreground/20 transition-all duration-200"
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl ${style.color} mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium text-foreground text-center">{category.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground text-center">{meta}</p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
