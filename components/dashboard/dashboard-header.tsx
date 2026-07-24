"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Menu,
  X,
  Bell,
  Search,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Heart,
  Settings,
  LogOut,
  Trophy,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const mobileNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Certificates", href: "/dashboard/certificates", icon: GraduationCap },
  { name: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: "student" | "instructor" } | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [meRes, unreadRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }).catch(() => null),
        fetch("/api/notifications/unread-count", { cache: "no-store" }).catch(() => null),
      ])
      const meJson = meRes ? await meRes.json().catch(() => null) : null
      const unreadJson = unreadRes ? await unreadRes.json().catch(() => null) : null
      if (!cancelled) {
        setUser(meJson?.user ?? null)
        setUnreadCount(typeof unreadJson?.count === "number" ? unreadJson.count : 0)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const refresh = () => {
      fetch("/api/notifications/unread-count", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => setUnreadCount(typeof j?.count === "number" ? j.count : 0))
        .catch(() => null)
    }

    const interval = setInterval(() => {
      refresh()
    }, 30000)

    window.addEventListener("learnify:notifications-updated", refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener("learnify:notifications-updated", refresh)
    }
  }, [])

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") ?? "U"

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
          aria-label="Open dashboard menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shadow-xs">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground">Zim Learning</span>
        </Link>

        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search courses..."
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Button asChild variant="ghost" size="icon" className="relative rounded-md">
            <Link href="/dashboard/notifications" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <div className="hidden h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary sm:flex">
            {initials}
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="hidden sm:inline-flex">
            Log out
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
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
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold text-sidebar-foreground">Zim Learning</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="Close dashboard menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-1 p-4">
            {mobileNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <item.icon className="h-5 w-5" />
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
