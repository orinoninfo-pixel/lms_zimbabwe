"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

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
    "text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
  const primaryCtaClass =
    "inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
  const secondaryPillClass =
    "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-medium text-slate-700 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
                <span className="text-lg font-bold text-white">Z</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-slate-900">Zim Learning</span>
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
            className="md:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            <Link href="/courses" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-2">
              Courses
            </Link>
            <Link href="/categories" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-2">
              Categories
            </Link>
            <Link href="/for-business" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-2">
              For Business
            </Link>
            <Link href="/zimbabwe-learning-hub" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-2">
              Zimbabwe Learning Hub
            </Link>
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              {isLoggedIn ? (
                <>
                  <Link
                    href={dashboard.href}
                    className="block w-full text-center text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
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
                      className="block w-full text-center text-sm text-slate-600 hover:text-slate-900 transition-colors py-2"
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
