import Link from "next/link"
import { BookOpen, ClipboardCheck, Cpu, Map, Target, TrendingUp, Trophy, Users } from "lucide-react"
import { prisma } from "@/lib/prisma"

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
  "mathematical-literacy": { icon: Target, meta: "Grades 10–12", color: "bg-primary/12 text-primary" },
  mathematics: { icon: Target, meta: "Grades 8–12", color: "bg-primary/12 text-primary" },
  "physical-sciences": { icon: Trophy, meta: "ZIMSEC-aligned", color: "bg-accent/22 text-accent-foreground" },
  "life-sciences": { icon: Users, meta: "Grades 10–12", color: "bg-secondary/20 text-secondary-foreground" },
  accounting: { icon: TrendingUp, meta: "Grades 10–12", color: "bg-warning/20 text-warning-foreground" },
  "business-studies": { icon: Users, meta: "Grades 10–12", color: "bg-info/20 text-info" },
  economics: { icon: TrendingUp, meta: "Grades 10–12", color: "bg-success/20 text-success" },
  english: { icon: BookOpen, meta: "Language & writing", color: "bg-destructive/16 text-destructive" },
  afrikaans: { icon: BookOpen, meta: "Language & writing", color: "bg-destructive/12 text-destructive" },
  geography: { icon: Map, meta: "Maps & revision", color: "bg-info/20 text-info" },
  history: { icon: BookOpen, meta: "Essays & revision", color: "bg-primary/16 text-primary" },
  cat: { icon: Cpu, meta: "Digital skills", color: "bg-primary/12 text-primary" },
  it: { icon: Cpu, meta: "Programming basics", color: "bg-info/20 text-info" },
  "homework-help": { icon: ClipboardCheck, meta: "Step-by-step help", color: "bg-warning/20 text-warning-foreground" },
  "holiday-catch-up": { icon: Trophy, meta: "Catch up fast", color: "bg-warning/20 text-warning-foreground" },
}

export async function CategoriesSection() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
    take: 8,
  })

  return (
    <section id="categories" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Browse by Category
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore our wide range of topics and find the perfect course for your learning journey
          </p>
        </div>
        {categories.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center shadow-xs">
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
            {categories.map((category) => {
              const style = styleBySlug[category.slug] ?? defaultStyle
              const Icon = style.icon
              const meta = styleBySlug[category.slug]?.meta ?? defaultStyle.meta
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
              >
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-md ${style.color} transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
              </Link>
            )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
