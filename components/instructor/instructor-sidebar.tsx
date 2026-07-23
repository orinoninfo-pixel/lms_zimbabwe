"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Video,
  ClipboardList,
  Users,
  DollarSign,
  Settings,
  HelpCircle,
  LogOut,
  GraduationCap,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { name: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { name: "My Subjects", href: "/instructor/subjects", icon: Layers },
  { name: "Live Lessons", href: "/instructor/live-lessons", icon: Video },
  { name: "Homework", href: "/instructor/homework", icon: ClipboardList },
  { name: "Students", href: "/instructor/students", icon: Users },
  { name: "Earnings", href: "/instructor/earnings", icon: DollarSign },
  { name: "Course Reviews", href: "/instructor/reviews", icon: Star },
]

const bottomNavigation = [
  { name: "Profile Settings", href: "/instructor/settings", icon: Settings },
  { name: "Help Center", href: "/help", icon: HelpCircle },
]

export function InstructorSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: "student" | "instructor" } | null>(null)

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
      .join("") ?? "I"

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    window.location.href = "/"
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <Link href="/" className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Zim Learning</span>
        </Link>

        {/* Badge */}
        <div className="mx-3 mt-4 rounded-lg bg-accent/30 px-3 py-2">
          <p className="text-xs font-medium text-accent-foreground">Instructor Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Manage
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border px-3 py-4">
          <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Account
          </div>
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name ?? "Instructor"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
