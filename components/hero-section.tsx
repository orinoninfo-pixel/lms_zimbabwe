import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <span className="flex h-2 w-2 rounded-full bg-accent" />
            Over 50,000+ students enrolled
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            Master New Skills
            <br />
            <span className="text-muted-foreground">at Your Own Pace</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed text-pretty">
            Transform your career with world-class online courses. Learn from industry experts, 
            earn certificates, and unlock new opportunities with our comprehensive learning platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="gap-2 px-6">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button asChild variant="outline" size="lg" className="gap-2 px-6">
              <Link href="/sa-learning-hub">
                <Play className="h-4 w-4" />
                Explore Learning Hub
              </Link>
            </Button>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
            {[
              { value: "500+", label: "Courses" },
              { value: "50K+", label: "Students" },
              { value: "200+", label: "Instructors" },
              { value: "4.9", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-semibold text-foreground sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
