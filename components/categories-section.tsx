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
  color: "bg-slate-100 text-slate-700",
}

const styleBySlug: Record<string, CategoryStyle> = {
  "mathematical-literacy": { icon: Target, meta: "Grades 10–12", color: "bg-blue-100 text-blue-700" },
  mathematics: { icon: Target, meta: "Grades 8–12", color: "bg-blue-100 text-blue-700" },
  "physical-sciences": { icon: Trophy, meta: "ZIMSEC-aligned", color: "bg-pink-100 text-pink-700" },
  "life-sciences": { icon: Users, meta: "Grades 10–12", color: "bg-green-100 text-green-700" },
  accounting: { icon: TrendingUp, meta: "Grades 10–12", color: "bg-amber-100 text-amber-700" },
  "business-studies": { icon: Users, meta: "Grades 10–12", color: "bg-indigo-100 text-indigo-700" },
  economics: { icon: TrendingUp, meta: "Grades 10–12", color: "bg-emerald-100 text-emerald-700" },
  english: { icon: BookOpen, meta: "Language & writing", color: "bg-red-100 text-red-700" },
  afrikaans: { icon: BookOpen, meta: "Language & writing", color: "bg-rose-100 text-rose-700" },
  geography: { icon: Map, meta: "Maps & revision", color: "bg-cyan-100 text-cyan-700" },
  history: { icon: BookOpen, meta: "Essays & revision", color: "bg-violet-100 text-violet-700" },
  cat: { icon: Cpu, meta: "Digital skills", color: "bg-fuchsia-100 text-fuchsia-700" },
  it: { icon: Cpu, meta: "Programming basics", color: "bg-sky-100 text-sky-700" },
  "homework-help": { icon: ClipboardCheck, meta: "Step-by-step help", color: "bg-orange-100 text-orange-700" },
  "holiday-catch-up": { icon: Trophy, meta: "Catch up fast", color: "bg-yellow-100 text-yellow-700" },
}

export async function CategoriesSection() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
    take: 8,
  })

  return (
    <section id="categories" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
            Browse by Category
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of topics and find the perfect course for your learning journey
          </p>
        </div>
        {categories.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
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
                className="group flex flex-col items-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-muted-foreground/20 transition-all duration-200"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${style.color} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-foreground">{category.name}</h3>
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
