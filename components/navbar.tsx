"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [session, setSession] = useState<{ userId: string; role: "student" | "instructor" | "admin" } | null>(null)

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
  const dashboardHref =
    session?.role === "admin" ? "/admin" : session?.role === "instructor" ? "/instructor" : "/dashboard"
  const showBecomeInstructor = !isLoggedIn || session?.role === "student"

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    setSession(null)
    window.location.href = "/"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">Z</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Zim Learning</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Courses
              </Link>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </Link>
              <Link href="/for-business" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                For Business
              </Link>
              <Link href="/zimbabwe-learning-hub" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Zimbabwe Learning Hub
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {showBecomeInstructor ? (
                  <Link
                    href="/become-instructor"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Become an Instructor
                  </Link>
                ) : null}
                <Link href={dashboardHref} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {session?.role === "admin" ? "Admin" : session?.role === "instructor" ? "Instructor" : "Dashboard"}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/become-instructor"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Become an Instructor
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-4 space-y-3">
            <Link href="/courses" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Courses
            </Link>
            <Link href="/categories" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Categories
            </Link>
            <Link href="/for-business" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              For Business
            </Link>
            <Link href="/zimbabwe-learning-hub" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Zimbabwe Learning Hub
            </Link>
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              {isLoggedIn ? (
                <>
                  <Link href={dashboardHref} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {session?.role === "admin" ? "Admin" : session?.role === "instructor" ? "Instructor" : "Dashboard"}
                  </Link>
                  <Button variant="ghost" className="w-full justify-center" onClick={handleSignOut}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  {showBecomeInstructor ? (
                    <Link
                      href="/become-instructor"
                      className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      Become an Instructor
                    </Link>
                  ) : null}
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-center">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full">
                      Get Started
                    </Button>
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
