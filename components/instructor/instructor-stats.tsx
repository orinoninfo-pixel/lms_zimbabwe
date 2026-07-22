"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, BookOpen, Layers, Clock, Wallet } from "lucide-react"

type Stats = {
  totalStudents: number
  totalEnrollments: number
  courseCounts: { total: number; draft: number; pending: number; approved: number; rejected: number; suspended: number }
  earnings: { total: number; paidOut: number; pending: number }
}

const formatUsd = (amount: number) => `$${amount.toLocaleString("en-ZW")}`

export function InstructorStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setIsLoading(true)
      const res = await fetch("/api/instructor/stats", { cache: "no-store", signal: controller.signal }).catch(
        () => null
      )
      const json = res ? await res.json().catch(() => null) : null
      setStats(res && res.ok ? (json as Stats) : null)
      setIsLoading(false)
    }
    void load()
    return () => controller.abort()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <p className="text-sm text-destructive">Failed to load your stats.</p>
      </div>
    )
  }

  const draftsAndPending = stats.courseCounts.draft + stats.courseCounts.pending

  const primaryStats = [
    {
      name: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      change: `Across ${stats.courseCounts.total} course${stats.courseCounts.total === 1 ? "" : "s"}`,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      name: "Total Earnings",
      value: formatUsd(stats.earnings.total),
      change: stats.earnings.pending > 0 ? `${formatUsd(stats.earnings.pending)} pending payout` : "No pending payouts",
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      name: "Active Courses",
      value: stats.courseCounts.approved.toLocaleString(),
      change: draftsAndPending > 0 ? `${draftsAndPending} draft/pending` : "None pending",
      icon: BookOpen,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      name: "Total Enrollments",
      value: stats.totalEnrollments.toLocaleString(),
      change: "All-time",
      icon: Layers,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ]

  const secondaryStats = [
    {
      name: "Paid Out",
      value: formatUsd(stats.earnings.paidOut),
      icon: Wallet,
    },
    {
      name: "Pending Payout",
      value: formatUsd(stats.earnings.pending),
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryStats.map((stat) => (
          <div key={stat.name} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {secondaryStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4"
          >
            <div className="rounded-lg bg-muted p-2.5">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
