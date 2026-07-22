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
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Soft decorative background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-slate-200/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column: headline, badge, CTAs */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              Built for Zimbabwean learners and ambitious professionals
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl text-balance">
              Learn for School,
              <br />
              <span className="text-slate-400">Work, and Zimbabwe Exams</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 text-pretty">
              Access online courses, Zimbabwe Learning Hub support, and practical training designed for students,
              teachers, and working professionals across Zimbabwe.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/zimbabwe-learning-hub"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                <Play className="h-4 w-4" />
                Explore Zimbabwe Hub
              </Link>
            </div>

            {/* Social proof stats — glassmorphism grid */}
            <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 text-center shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="text-xl font-semibold text-slate-900 sm:text-2xl">{stat.value}</div>
                  <div className="mt-1 text-xs text-slate-500 sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: featured course card mockup */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-100/70 to-slate-100/40 blur-2xl" />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-emerald-500 to-slate-800">
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-md">
                  Bestseller
                </div>
                <button
                  type="button"
                  aria-label="Preview course"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  <Play className="h-5 w-5 fill-emerald-600 text-emerald-600" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">IT &amp; Software</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  Complete Web Development Bootcamp
                </h3>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    SI
                  </div>
                  <span className="text-sm text-slate-500">Sarah Instructor</span>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-slate-900">4.9</span>
                    <span className="text-slate-400">(2,340)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" />
                    12,000+
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-2xl font-semibold text-slate-900">$899</span>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-emerald-600 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
                  >
                    <Link href="/courses">View course</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating trust chip */}
            <div className="absolute -bottom-6 -left-6 hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:flex">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Certificate included</p>
                <p className="text-xs text-slate-500">On course completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
