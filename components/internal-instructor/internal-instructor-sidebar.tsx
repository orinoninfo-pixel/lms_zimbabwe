"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Layers,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Video,
  ClipboardList,
  Tags,
  ListChecks,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/internal-instructor", icon: LayoutDashboard },
  { name: "My Courses", href: "/internal-instructor/courses", icon: BookOpen },
  { name: "My Subjects", href: "/internal-instructor/subjects", icon: GraduationCap },
  { name: "Live Lessons", href: "/internal-instructor/live-lessons", icon: Video },
  { name: "Homework", href: "/internal-instructor/homework", icon: ClipboardList },
  { name: "Categories", href: "/internal-instructor/categories", icon: Tags },
  { name: "Enrollments", href: "/internal-instructor/enrollments", icon: ListChecks },
  { name: "Reports", href: "/internal-instructor/reports", icon: BarChart3 },
  { name: "Settings", href: "/internal-instructor/settings", icon: Settings },
]

export function InternalInstructorSidebar() {
  const pathname = usePathname()
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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-sidebar lg:block">
      <div className="flex h-full flex-col">
        <Link href="/" className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary shadow-xs">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">Content</span>
        </Link>

        <div className="mx-4 mt-4 rounded-md bg-primary/10 px-3 py-2">
          <p className="text-xs font-semibold text-primary">Content Manager Console</p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
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

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name ?? "Content Manager"}</p>
              <p className="truncate text-xs text-sidebar-foreground/65">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={signOut}
              className="rounded-md p-2 text-sidebar-foreground/75 transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
