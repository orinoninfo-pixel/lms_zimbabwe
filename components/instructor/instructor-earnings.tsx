"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/admin/status-badge"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type Stats = {
  earnings: { total: number; paidOut: number; pending: number }
  revenueSplit: { commissionRateBps: number; platformCommissionPercent: number; instructorSharePercent: number }
  payoutHistory: Array<{
    id: string
    courseTitle: string
    amount: number
    status: "pending" | "succeeded" | "failed" | "reversed"
    reference: string | null
    createdAt: string
  }>
}

const formatUsd = (amount: number) => `$${amount.toLocaleString("en-ZW")}`

export function InstructorEarnings() {
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
    return <p className="text-sm text-muted-foreground">Loading earnings...</p>
  }

  if (!stats) {
    return <p className="text-sm text-destructive">Failed to load your earnings.</p>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{formatUsd(stats.earnings.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Paid out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{formatUsd(stats.earnings.paidOut)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{formatUsd(stats.earnings.pending)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue split</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            For every paid enrollment, Zim Learning automatically splits the sale as soon as the payment succeeds:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">You keep</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">
                {stats.revenueSplit.instructorSharePercent}%
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Platform commission</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {stats.revenueSplit.platformCommissionPercent}%
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            This rate is set platform-wide by Zim Learning admins and applies automatically to every sale — it
            isn&apos;t something you need to configure.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Payout history</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.payoutHistory.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon" />
                <EmptyTitle>No payouts yet</EmptyTitle>
                <EmptyDescription>Payouts appear here once students purchase your courses.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.payoutHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground">{p.courseTitle}</td>
                      <td className="px-4 py-3">
                        <StatusBadge kind="transaction" value={p.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-foreground tabular-nums">
                        {formatUsd(p.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {p.reference ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("en-ZW")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
