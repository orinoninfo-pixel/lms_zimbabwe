"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StatusBadge } from "@/components/admin/status-badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { toast } from "@/hooks/use-toast"

type InstructorRow = {
  id: string
  name: string
  email: string
  role: "instructor"
  status: "active" | "suspended" | "banned"
  createdAt: string
  courses: number
  students: number
  payoutsZar: number
}

const formatZar = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount)

export function AdminInstructorsTable() {
  const [rows, setRows] = useState<InstructorRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<string>("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (q.trim()) params.set("q", q.trim())
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [status, q])

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/instructors${queryString}`, { cache: "no-store", signal }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) {
      setRows([])
      setIsLoading(false)
      setError(json?.error ?? "Failed to load instructors")
      return
    }
    setRows((json?.instructors ?? []) as InstructorRow[])
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [queryString])

  const patchUser = async (body: unknown) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) throw new Error(json?.error ?? "Request failed")
    return json
  }

  const onStatusAction = async (userId: string, action: "activate" | "suspend" | "ban") => {
    setBusyId(userId)
    try {
      await patchUser({ userId, action })
      toast({ title: "Instructor updated" })
      await load()
    } catch (e) {
      toast({ title: "Failed to update instructor", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Instructors</h2>
          <p className="text-sm text-muted-foreground">Manage instructors, their courses, and payouts</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email..." />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
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
              <EmptyTitle>No instructors found</EmptyTitle>
              <EmptyDescription>Try adjusting your filters or search term.</EmptyDescription>
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
                  Instructor
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Courses
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Students
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Payouts (ZAR)
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const busy = busyId === r.id
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge kind="user" value={r.status} />
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-foreground tabular-nums">{r.courses}</td>
                    <td className="px-5 py-4 text-right text-sm text-foreground tabular-nums">{r.students}</td>
                    <td className="px-5 py-4 text-right text-sm text-foreground tabular-nums">
                      {formatZar(r.payoutsZar)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void onStatusAction(r.id, "activate")}
                          disabled={busy || r.status === "active"}
                        >
                          Activate
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void onStatusAction(r.id, "suspend")}
                          disabled={busy || r.status === "suspended"}
                        >
                          Suspend
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="outline" size="sm" disabled={busy || r.status === "banned"}>
                              Ban
                            </Button>
                          }
                          title="Ban instructor?"
                          description="Banned instructors cannot log in or publish courses. You can unban by setting status to Active."
                          confirmText="Ban instructor"
                          onConfirm={() => void onStatusAction(r.id, "ban")}
                          disabled={busy || r.status === "banned"}
                        />
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
