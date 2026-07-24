"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  Trophy,
  Bell,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Certificates", href: "/dashboard/certificates", icon: GraduationCap },
  { name: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
]

const bottomNavigation = [
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help Center", href: "/dashboard/help", icon: HelpCircle },
]

export function DashboardSidebar() {
  const pathname = usePathname()
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

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname === href || pathname.startsWith(`${href}/`)
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

        <nav className="flex-1 space-y-1 px-4 py-5">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Learning
          </div>
          {navigation.map((item) => {
            const isActive = isActiveLink(item.href)
            const showBadge = item.href === "/dashboard/notifications" && unreadCount > 0
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
                <span className="flex-1">{item.name}</span>
                {showBadge ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-sm bg-destructive px-1.5 text-[11px] font-medium text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Account
          </div>
          {bottomNavigation.map((item) => {
            const isActive = isActiveLink(item.href)
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
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name ?? "Account"}</p>
              <p className="truncate text-xs text-sidebar-foreground/65">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
