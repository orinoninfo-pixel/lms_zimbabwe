import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ZimbabweLearningHub } from "@/components/zimbabwe-hub/zimbabwe-learning-hub"

export const dynamic = "force-dynamic"

export default function ZimbabweLearningHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="border-b border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 md:py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-accent">Zimbabwe Learning Hub</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Subject support built for Zimbabwean learners
              </h1>
              <p className="mt-4 text-base text-muted-foreground">
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
