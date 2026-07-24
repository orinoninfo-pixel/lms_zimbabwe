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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-sidebar lg:block">
      <div className="flex h-full flex-col">
        <Link href="/" className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary shadow-xs">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">Zim Learning</span>
        </Link>

        <div className="mx-4 mt-4 rounded-md bg-primary/10 px-3 py-2">
          <p className="text-xs font-semibold text-primary">Instructor Portal</p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Manage
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Account
          </div>
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name ?? "Instructor"}</p>
              <p className="truncate text-xs text-sidebar-foreground/65">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
