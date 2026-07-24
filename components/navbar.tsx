"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeSwitcher } from "@/components/theme-switcher"

type SessionRole = "student" | "instructor" | "admin" | "internal_instructor"

const dashboardMeta: Record<SessionRole, { href: string; label: string }> = {
  admin: { href: "/admin", label: "Admin" },
  internal_instructor: { href: "/internal-instructor", label: "Console" },
  instructor: { href: "/instructor", label: "Instructor" },
  student: { href: "/dashboard", label: "Dashboard" },
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [session, setSession] = useState<{ userId: string; role: SessionRole } | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!cancelled) setSession(json?.session ?? null)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const isLoggedIn = Boolean(session?.userId)
  const dashboard = session ? dashboardMeta[session.role] : dashboardMeta.student
  const showBecomeInstructor = !isLoggedIn || session?.role === "student"

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    setSession(null)
    window.location.href = "/"
  }

  const navLinkClass =
    "text-sm font-medium text-foreground/75 transition-colors duration-200 hover:text-foreground"
  const primaryCtaClass =
    "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/95"
  const secondaryPillClass =
    "inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-muted hover:text-foreground"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary shadow-xs">
                <span className="text-lg font-bold text-white">Z</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">Zim Learning</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/courses" className={navLinkClass}>
                Courses
              </Link>
              <Link href="/categories" className={navLinkClass}>
                Categories
              </Link>
              <Link href="/for-business" className={navLinkClass}>
                For Business
              </Link>
              <Link href="/zimbabwe-learning-hub" className={navLinkClass}>
                Zimbabwe Learning Hub
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeSwitcher />
            {isLoggedIn ? (
              <>
                {showBecomeInstructor ? (
                  <Link href="/become-instructor" className={navLinkClass}>
                    Become an Instructor
                  </Link>
                ) : null}
                <Link href={dashboard.href} className={navLinkClass}>
                  {dashboard.label}
                </Link>
                <button onClick={handleSignOut} className={secondaryPillClass}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/become-instructor" className={navLinkClass}>
                  Become an Instructor
                </Link>
                <Link href="/login" className={secondaryPillClass}>
                  Log in
                </Link>
                <Link href="/register" className={primaryCtaClass}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-md p-2 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-2 px-4 py-4">
            <Link href="/courses" className="block rounded-md px-2 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground">
              Courses
            </Link>
            <Link href="/categories" className="block rounded-md px-2 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground">
              Categories
            </Link>
            <Link href="/for-business" className="block rounded-md px-2 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground">
              For Business
            </Link>
            <Link href="/zimbabwe-learning-hub" className="block rounded-md px-2 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground">
              Zimbabwe Learning Hub
            </Link>
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <ThemeSwitcher mobile />
              {isLoggedIn ? (
                <>
                  <Link
                    href={dashboard.href}
                    className="block w-full rounded-md px-3 py-2 text-center text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {dashboard.label}
                  </Link>
                  <button onClick={handleSignOut} className={cn(secondaryPillClass, "w-full")}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  {showBecomeInstructor ? (
                    <Link
                      href="/become-instructor"
                      className="block w-full rounded-md px-3 py-2 text-center text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Become an Instructor
                    </Link>
                  ) : null}
                  <Link href="/login" className={cn(secondaryPillClass, "w-full")}>
                    Log in
                  </Link>
                  <Link href="/register" className={cn(primaryCtaClass, "w-full")}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
