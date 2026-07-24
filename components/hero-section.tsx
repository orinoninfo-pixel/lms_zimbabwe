import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play, Star, Users, CheckCircle2 } from "lucide-react"

const stats = [
  { value: "500+", label: "Courses" },
  { value: "50K+", label: "Students" },
  { value: "200+", label: "Instructors" },
  { value: "4.9", label: "Rating" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/30 pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-sm bg-primary" />
              Built for Zimbabwean learners and ambitious professionals
            </div>

            <h1 className="mt-6 max-w-xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Learn for School,
              <br />
              <span className="text-foreground/45">Work, and Zimbabwe Exams</span>
            </h1>

            <p className="text-subtitle mt-6 max-w-xl text-pretty">
              Access online courses, Zimbabwe Learning Hub support, and practical training designed for students,
              teachers, and working professionals across Zimbabwe.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-xs transition-colors duration-200 hover:bg-primary/95"
              >
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/zimbabwe-learning-hub"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-base font-medium text-foreground/80 transition-colors duration-200 hover:bg-muted hover:text-foreground"
              >
                <Play className="h-4 w-4" />
                Explore Zimbabwe Hub
              </Link>
            </div>

            <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-card px-4 py-4 text-center shadow-xs transition-colors duration-200 hover:border-primary/20"
                >
                  <div className="text-xl font-semibold text-foreground sm:text-2xl">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl" />

            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-primary to-foreground/85">
                <div className="absolute left-4 top-4 rounded-md bg-background/95 px-3 py-1 text-xs font-semibold text-primary">
                  Bestseller
                </div>
                <button
                  type="button"
                  aria-label="Preview course"
                  className="flex h-14 w-14 items-center justify-center rounded-md bg-background/95 shadow-sm transition-all duration-200 hover:bg-background"
                >
                  <Play className="h-5 w-5 fill-primary text-primary" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">IT &amp; Software</p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  Complete Web Development Bootcamp
                </h3>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground/70">
                    SI
                  </div>
                  <span className="text-sm text-muted-foreground">Sarah Instructor</span>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">4.9</span>
                    <span className="text-muted-foreground">(2,340)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    12,000+
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-2xl font-semibold text-foreground">$899</span>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-md"
                  >
                    <Link href="/courses">View course</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-sm sm:flex">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Certificate included</p>
                <p className="text-xs text-muted-foreground">On course completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
