"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Shield,
  LayoutDashboard,
  Users,
  GraduationCap,
  BadgeCheck,
  BookOpen,
  Layers,
  Tags,
  ListChecks,
  Receipt,
  Flag,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Instructors", href: "/admin/instructors", icon: GraduationCap },
  { name: "Applications", href: "/admin/instructor-applications", icon: BadgeCheck },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Subjects", href: "/admin/subjects", icon: Layers },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Enrollments", href: "/admin/enrollments", icon: ListChecks },
  { name: "Transactions", href: "/admin/transactions", icon: Receipt },
  { name: "Reports", href: "/admin/reports", icon: Flag },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
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
      .join("") ?? "A"

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    window.location.href = "/"
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden lg:block">
      <div className="flex h-full flex-col">
        <Link href="/" className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Admin</span>
        </Link>

        <div className="mx-3 mt-4 rounded-lg bg-accent/30 px-3 py-2">
          <p className="text-xs font-medium text-accent-foreground">Platform Console</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
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

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
