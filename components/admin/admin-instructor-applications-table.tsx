"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/admin/status-badge"
import { toast } from "@/hooks/use-toast"

type ApplicationRow = {
  id: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  reviewedAt: string | null
  notes: string | null
  phone: string | null
  linkedinUrl: string | null
  expertise: string | null
  yearsExperience: number | null
  certifications: string | null
  biography: string | null
  sampleCourseProposal: string | null
  preferredCategorySlugs: string[]
  resumeFileName: string | null
  user: { id: string; name: string; email: string; role: string; status: string }
}

export function AdminInstructorApplicationsTable() {
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("pending")
  const [q, setQ] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">("approve")
  const [dialogAppId, setDialogAppId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [viewOpen, setViewOpen] = useState(false)
  const [viewRow, setViewRow] = useState<ApplicationRow | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [status])

  const load = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/instructor-applications${queryString}`, { cache: "no-store", signal }).catch(
      () => null
    )
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) {
      setRows([])
      setIsLoading(false)
      setError(json?.error ?? "Failed to load applications")
      return
    }
    setRows((json?.applications ?? []) as ApplicationRow[])
    setIsLoading(false)
  }, [queryString])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((r) => r.user.email.toLowerCase().includes(term) || r.user.name.toLowerCase().includes(term))
  }, [rows, q])

  const openDialog = (applicationId: string, action: "approve" | "reject") => {
    setDialogAppId(applicationId)
    setDialogAction(action)
    setNotes("")
    setDialogOpen(true)
  }

  const openView = (row: ApplicationRow) => {
    setViewRow(row)
    setViewOpen(true)
  }

  const submit = async () => {
    if (!dialogAppId) return
    setBusyId(dialogAppId)
    try {
      const res = await fetch("/api/admin/instructor-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: dialogAppId,
          action: dialogAction,
          notes: notes.trim() ? notes.trim() : undefined,
        }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Request failed")
      toast({ title: dialogAction === "approve" ? "Application approved" : "Application rejected" })
      setDialogOpen(false)
      await load()
    } catch (e) {
      toast({ title: "Failed to update application", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Instructor Applications</h2>
          <p className="text-sm text-muted-foreground">Approve or reject instructor requests</p>
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
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : null}

      {!isLoading && filtered.length === 0 ? (
        <div className="p-6">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No applications found</EmptyTitle>
              <EmptyDescription>There are no matching instructor applications.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      ) : null}

      {filtered.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Applicant
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => {
                const busy = busyId === r.id
                const canAct = r.status === "pending" && r.user.status === "active"
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{r.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge kind="application" value={r.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openView(r)}>
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openDialog(r.id, "approve")}
                          disabled={busy || !canAct}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(r.id, "reject")}
                          disabled={busy || !canAct}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application details</DialogTitle>
            <DialogDescription>Review instructor application information and supporting documents.</DialogDescription>
          </DialogHeader>

          {viewRow ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">{viewRow.user.name}</p>
                <p className="text-sm text-muted-foreground">{viewRow.user.email}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Status: <span className="text-foreground">{viewRow.status}</span>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{viewRow.phone ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">Years of experience</p>
                  <p className="text-sm text-foreground">{viewRow.yearsExperience ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">LinkedIn</p>
                  {viewRow.linkedinUrl ? (
                    <a className="text-sm text-accent hover:underline break-all" href={viewRow.linkedinUrl} target="_blank" rel="noreferrer">
                      {viewRow.linkedinUrl}
                    </a>
                  ) : (
                    <p className="text-sm text-foreground">-</p>
                  )}
                </div>
                <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Area of expertise</p>
                  <p className="text-sm text-foreground">{viewRow.expertise ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Professional certifications</p>
                  <p className="text-sm text-foreground">{viewRow.certifications ?? "-"}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Preferred categories</p>
                <p className="mt-1 text-sm text-foreground">{viewRow.preferredCategorySlugs?.length ? viewRow.preferredCategorySlugs.join(", ") : "-"}</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Biography</p>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{viewRow.biography ?? "-"}</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Sample course proposal</p>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{viewRow.sampleCourseProposal ?? "-"}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">CV/Resume</p>
                  <p className="text-xs text-muted-foreground truncate">{viewRow.resumeFileName ?? "No file uploaded"}</p>
                </div>
                {viewRow.resumeFileName ? (
                  <Button asChild variant="outline">
                    <a href={`/api/admin/instructor-applications/${viewRow.id}/resume`}>Download</a>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction === "approve" ? "Approve application" : "Reject application"}</DialogTitle>
            <DialogDescription>
              {dialogAction === "approve"
                ? "The user will be promoted to instructor."
                : "The user will remain a student."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="notes">
              Notes (optional)
            </label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note..." />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={!dialogAppId || busyId === dialogAppId}>
              {dialogAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
