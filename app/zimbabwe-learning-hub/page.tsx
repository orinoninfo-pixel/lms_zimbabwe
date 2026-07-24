import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ZimbabweLearningHub } from "@/components/zimbabwe-hub/zimbabwe-learning-hub"

// Static marketing content, no session/DB read at this level.
export const revalidate = 3600

export default function ZimbabweLearningHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-muted/30 to-primary/10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-secondary/20 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 md:py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Zimbabwe Learning Hub</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Subject support built for Zimbabwean learners
              </h1>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                Explore ZIMSEC-aligned subjects, revision resources, live lessons, and flexible monthly subscriptions.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ZimbabweLearningHub />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
