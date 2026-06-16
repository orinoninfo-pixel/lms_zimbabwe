"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { StatusBadge } from "@/components/admin/status-badge"
import { toast } from "@/hooks/use-toast"

type ReportRow = {
  id: string
  type: "course_complaint" | "user_report"
  status: "open" | "reviewing" | "resolved" | "dismissed"
  message: string
  createdAt: string
  resolvedAt: string | null
  reporter: { id: string; name: string; email: string }
  course: { id: string; title: string; status: string } | null
  accusedUser: { id: string; name: string; email: string; role: string; status: string } | null
  resolver: { id: string; name: string; email: string } | null
}

export function AdminReportsTable() {
  const [rows, setRows] = useState<ReportRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [type, setType] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    if (q.trim()) params.set("q", q.trim())
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [type, status, q])

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/reports${queryString}`, { cache: "no-store", signal }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) {
      setRows([])
      setIsLoading(false)
      setError(json?.error ?? "Failed to load reports")
      return
    }
    setRows((json?.reports ?? []) as ReportRow[])
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [queryString])

  const patch = async (reportId: string, action: string) => {
    setBusyId(reportId)
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Request failed")
      toast({ title: "Report updated" })
      await load()
    } catch (e) {
      toast({ title: "Failed to update report", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground">Handle course complaints and user reports</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reporter, course, user, message..." />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">All types</option>
              <option value="course_complaint">Course complaint</option>
              <option value="user_report">User report</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : null}

      {!isLoading && rows.length === 0 ? (
        <div className="p-6">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No reports</EmptyTitle>
              <EmptyDescription>No reports match the selected filters.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      ) : null}

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Report
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Target
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const busy = busyId === r.id
                const when = new Date(r.createdAt).toLocaleString("en-ZA")
                const message = r.message.length > 140 ? `${r.message.slice(0, 140)}…` : r.message
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors align-top">
                    <td className="px-5 py-4">
                      <div className="space-y-1 min-w-[280px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{r.type}</span>
                          <span className="text-xs text-muted-foreground">{when}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.reporter.name} · {r.reporter.email}
                        </div>
                        <div className="text-sm text-foreground">{message}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge kind="report" value={r.status} />
                    </td>
                    <td className="px-5 py-4">
                      {r.course ? (
                        <div className="min-w-[260px]">
                          <div className="text-sm text-foreground">{r.course.title}</div>
                          <div className="text-xs text-muted-foreground">Course status: {r.course.status}</div>
                        </div>
                      ) : r.accusedUser ? (
                        <div className="min-w-[260px]">
                          <div className="text-sm text-foreground">{r.accusedUser.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.accusedUser.email} · {r.accusedUser.role} · {r.accusedUser.status}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-end gap-2 min-w-[240px]">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void patch(r.id, "markReviewing")}
                            disabled={busy || r.status !== "open"}
                          >
                            Review
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void patch(r.id, "resolve")}
                            disabled={busy || r.status === "resolved" || r.status === "dismissed"}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void patch(r.id, "dismiss")}
                            disabled={busy || r.status === "resolved" || r.status === "dismissed"}
                          >
                            Dismiss
                          </Button>
                        </div>

                        {r.accusedUser ? (
                          <div className="flex gap-2">
                            <ConfirmDialog
                              trigger={
                                <Button variant="outline" size="sm" disabled={busy}>
                                  Suspend user
                                </Button>
                              }
                              title="Suspend user?"
                              description="Suspended users cannot log in."
                              confirmText="Suspend"
                              onConfirm={() => void patch(r.id, "suspendAccusedUser")}
                              disabled={busy}
                            />
                            <ConfirmDialog
                              trigger={
                                <Button variant="destructive" size="sm" disabled={busy}>
                                  Ban user
                                </Button>
                              }
                              title="Ban user?"
                              description="Banned users cannot log in."
                              confirmText="Ban"
                              onConfirm={() => void patch(r.id, "banAccusedUser")}
                              disabled={busy}
                            />
                          </div>
                        ) : null}

                        {r.course ? (
                          <div className="flex gap-2">
                            <ConfirmDialog
                              trigger={
                                <Button variant="outline" size="sm" disabled={busy}>
                                  Suspend course
                                </Button>
                              }
                              title="Suspend course?"
                              description="Suspended courses will not accept new enrollments."
                              confirmText="Suspend"
                              onConfirm={() => void patch(r.id, "suspendCourse")}
                              disabled={busy}
                            />
                            <ConfirmDialog
                              trigger={
                                <Button variant="destructive" size="sm" disabled={busy}>
                                  Delete course
                                </Button>
                              }
                              title="Delete course?"
                              description="This action is permanent."
                              confirmText="Delete"
                              onConfirm={() => void patch(r.id, "deleteCourse")}
                              disabled={busy}
                            />
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
