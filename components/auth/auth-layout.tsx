import type { ReactNode } from "react"
import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthLayoutProps = {
  children: ReactNode
  title: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-secondary-surface),transparent_58%)]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Go to Zim Learning home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary shadow-xs">
                <span className="text-lg font-bold text-primary-foreground">Z</span>
              </div>
              <div>
                <p className="font-display text-lg font-semibold tracking-tight text-foreground">Zim Learning</p>
                <p className="text-xs text-muted-foreground">Learn. Grow. Lead.</p>
              </div>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-foreground/80 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ← Back to home
            </Link>
          </div>

          <ThemeSwitcher />
        </header>

        <section className="mx-auto w-full max-w-md space-y-4" aria-labelledby="auth-page-title">
          <div className="space-y-1 text-center">
            <h1 id="auth-page-title" className="text-3xl font-semibold leading-tight text-foreground">
              {title}
            </h1>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>

          {children}
        </section>

        <footer className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link href="/privacy" className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Privacy Policy
          </Link>
          <span aria-hidden="true">|</span>
          <Link href="/terms" className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Terms
          </Link>
        </footer>
      </div>
    </main>
  )
}

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn("border-border/80 bg-card/95 shadow-md backdrop-blur", className)}>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  )
}
