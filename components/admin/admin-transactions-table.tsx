"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/admin/status-badge"
import { toast } from "@/hooks/use-toast"

type TxUser = { id: string; name: string; email: string; role: string } | null
type TxCourse = { id: string; title: string } | null

type TransactionRow = {
  id: string
  type: "enrollment" | "payout" | "commission" | "refund" | "adjustment"
  status: "pending" | "succeeded" | "failed" | "reversed"
  currency: "USD" | "ZWL" | "ZAR"
  amount: number
  reference: string | null
  description: string | null
  createdAt: string
  user: TxUser
  course: TxCourse
}

type InstructorOption = { id: string; name: string; email: string }

function formatMoney(amount: number, currency: TransactionRow["currency"]) {
  return new Intl.NumberFormat("en-ZW", { style: "currency", currency }).format(amount)
}

export function AdminTransactionsTable() {
  const [rows, setRows] = useState<TransactionRow[]>([])
  const [totals, setTotals] = useState<{ revenueUsd: number; payoutsUsd: number; commissionsUsd: number }>({
    revenueUsd: 0,
    payoutsUsd: 0,
    commissionsUsd: 0,
  })
  const [instructors, setInstructors] = useState<InstructorOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [type, setType] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newType, setNewType] = useState<TransactionRow["type"]>("payout")
  const [newStatus, setNewStatus] = useState<TransactionRow["status"]>("succeeded")
  const [newAmount, setNewAmount] = useState<string>("")
  const [newInstructorId, setNewInstructorId] = useState<string>("")
  const [newReference, setNewReference] = useState<string>("")
  const [newDescription, setNewDescription] = useState<string>("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    if (q.trim()) params.set("q", q.trim())
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [type, status, q])

  const load = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    const [txRes, instructorRes] = await Promise.all([
      fetch(`/api/admin/transactions${queryString}`, { cache: "no-store", signal }).catch(() => null),
      fetch(`/api/admin/instructors`, { cache: "no-store", signal }).catch(() => null),
    ])

    const txJson = txRes ? await txRes.json().catch(() => null) : null
    const iJson = instructorRes ? await instructorRes.json().catch(() => null) : null

    if (!txRes || !txRes.ok) {
      setRows([])
      setIsLoading(false)
      setError(txJson?.error ?? "Failed to load transactions")
      return
    }

    setRows((txJson?.transactions ?? []) as TransactionRow[])
    setTotals(
      (txJson?.totals as { revenueUsd: number; payoutsUsd: number; commissionsUsd: number }) ?? {
        revenueUsd: 0,
        payoutsUsd: 0,
        commissionsUsd: 0,
      }
    )
    setInstructors(
      ((iJson?.instructors ?? []) as Array<{ id: string; name: string; email: string }>).map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email,
      }))
    )
    setIsLoading(false)
  }, [queryString])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const patchTx = async (body: unknown) => {
    const res = await fetch("/api/admin/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) throw new Error(json?.error ?? "Request failed")
    return json
  }

  const createTx = async (body: unknown) => {
    const res = await fetch("/api/admin/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) throw new Error(json?.error ?? "Create failed")
    return json
  }

  const onSetStatus = async (id: string, nextStatus: TransactionRow["status"]) => {
    setBusyId(id)
    try {
      await patchTx({ transactionId: id, action: "setStatus", status: nextStatus })
      toast({ title: "Transaction updated" })
      await load()
    } catch (e) {
      toast({ title: "Failed to update transaction", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  const openCreate = () => {
    setNewType("payout")
    setNewStatus("succeeded")
    setNewAmount("")
    setNewInstructorId("")
    setNewReference("")
    setNewDescription("")
    setDialogOpen(true)
  }

  const submitCreate = async () => {
    const amount = Number.parseInt(newAmount, 10)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Amount must be a positive integer (USD)" })
      return
    }

    const needsUser = newType === "payout"
    if (needsUser && !newInstructorId) {
      toast({ title: "Select an instructor" })
      return
    }

    setBusyId("create")
    try {
      await createTx({
        type: newType,
        status: newStatus,
        currency: "USD",
        amount,
        userId: needsUser ? newInstructorId : null,
        reference: newReference.trim() ? newReference.trim() : undefined,
        description: newDescription.trim() ? newDescription.trim() : undefined,
      })
      toast({ title: "Transaction created" })
      setDialogOpen(false)
      await load()
    } catch (e) {
      toast({ title: "Failed to create transaction", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Revenue (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{formatMoney(totals.revenueUsd, "USD")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Commissions (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{formatMoney(totals.commissionsUsd, "USD")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Payouts (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{formatMoney(totals.payoutsUsd, "USD")}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex flex-col gap-4 p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Transactions</h2>
              <p className="text-sm text-muted-foreground">Track payments, revenue, payouts, and commissions</p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New transaction
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, user, course..." />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">All types</option>
                <option value="enrollment">Enrollment</option>
                <option value="commission">Commission</option>
                <option value="payout">Payout</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="reversed">Reversed</option>
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
                <EmptyTitle>No transactions</EmptyTitle>
                <EmptyDescription>No transactions match the selected filters.</EmptyDescription>
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
                    When
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    User
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Course
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Reference
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((t) => {
                  const busy = busyId === t.id
                  const when = new Date(t.createdAt).toLocaleString("en-ZW")
                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{when}</td>
                      <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap">{t.type}</td>
                      <td className="px-5 py-4">
                        <StatusBadge kind="transaction" value={t.status} />
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-foreground tabular-nums whitespace-nowrap">
                        {formatMoney(t.amount, t.currency)}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {t.user ? (
                          <div className="min-w-0">
                            <div className="truncate">{t.user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{t.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {t.course ? <span className="truncate">{t.course.title}</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{t.reference ?? "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <select
                            value={t.status}
                            onChange={(e) => void onSetStatus(t.id, e.target.value as TransactionRow["status"])}
                            disabled={busy}
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-60"
                            aria-label="Transaction status"
                          >
                            <option value="pending">pending</option>
                            <option value="succeeded">succeeded</option>
                            <option value="failed">failed</option>
                            <option value="reversed">reversed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New transaction</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="tx-type">
                  Type
                </label>
                <select
                  id="tx-type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TransactionRow["type"])}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="payout">payout</option>
                  <option value="adjustment">adjustment</option>
                  <option value="refund">refund</option>
                  <option value="commission">commission</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="tx-status">
                  Status
                </label>
                <select
                  id="tx-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TransactionRow["status"])}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="succeeded">succeeded</option>
                  <option value="pending">pending</option>
                  <option value="failed">failed</option>
                  <option value="reversed">reversed</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="tx-amount">
                  Amount (USD)
                </label>
                <Input
                  id="tx-amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 1200"
                />
              </div>

              {newType === "payout" ? (
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="tx-instructor">
                    Instructor
                  </label>
                  <select
                    id="tx-instructor"
                    value={newInstructorId}
                    onChange={(e) => setNewInstructorId(e.target.value)}
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select instructor...</option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.email})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="tx-ref">
                  Reference (optional)
                </label>
                <Input
                  id="tx-ref"
                  value={newReference}
                  onChange={(e) => setNewReference(e.target.value)}
                  placeholder="e.g. EFT-2026-00021"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="tx-desc">
                  Description (optional)
                </label>
                <Textarea
                  id="tx-desc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add a short description..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void submitCreate()} disabled={busyId === "create"}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
