"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X, Layers, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const mobileNavigation = [
  { name: "Overview", href: "/internal-instructor" },
  { name: "My Courses", href: "/internal-instructor/courses" },
  { name: "My Subjects", href: "/internal-instructor/subjects" },
  { name: "Live Lessons", href: "/internal-instructor/live-lessons" },
  { name: "Categories", href: "/internal-instructor/categories" },
  { name: "Enrollments", href: "/internal-instructor/enrollments" },
  { name: "Reports", href: "/internal-instructor/reports" },
  { name: "Settings", href: "/internal-instructor/settings" },
]

export function InternalInstructorHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!cancelled) setUser(json?.user ?? null)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") ?? "C"

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    window.location.href = "/"
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:px-6">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="-ml-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open content manager menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/internal-instructor" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shadow-xs">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground">Content</span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <div className="hidden h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary sm:flex">
            {initials}
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="hidden sm:inline-flex">
            Log out
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-200",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileMenuOpen(false)} />
        <nav
          className={cn(
            "absolute left-0 top-0 h-full w-72 border-r border-sidebar-border bg-sidebar shadow-md transition-transform duration-200",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shadow-xs">
                <Layers className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold text-sidebar-foreground">Content</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="Close content manager menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {mobileNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}
