"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { FilePenLine, Star, StarOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StatusBadge } from "@/components/admin/status-badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { toast } from "@/hooks/use-toast"

type CourseRow = {
  id: string
  title: string
  description: string
  moderationNote: string | null
  price: number
  status: "draft" | "pending" | "approved" | "rejected" | "suspended"
  featured: boolean
  createdAt: string
  instructor: { id: string; name: string; email: string }
  category: { id: string; name: string } | null
  _count: { enrollments: number; sections: number }
}

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export function AdminCoursesTable() {
  const [rows, setRows] = useState<CourseRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<string>("")
  const [featured, setFeatured] = useState<string>("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (featured) params.set("featured", featured)
    if (q.trim()) params.set("q", q.trim())
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [status, featured, q])

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    const coursesRes = await fetch(`/api/admin/courses${queryString}`, { cache: "no-store", signal }).catch(() => null)

    const coursesJson = coursesRes ? await coursesRes.json().catch(() => null) : null

    if (signal?.aborted) return

    if (!coursesRes || !coursesRes.ok) {
      setRows([])
      setIsLoading(false)
      setError(coursesJson?.error ?? "Failed to load courses")
      return
    }

    setRows((coursesJson?.courses ?? []) as CourseRow[])
    setPriceDrafts(
      Object.fromEntries((((coursesJson?.courses ?? []) as CourseRow[]) ?? []).map((course) => [course.id, String(course.price)]))
    )
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [queryString])

  const patchCourse = async (body: unknown) => {
    const res = await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) throw new Error(json?.error ?? "Request failed")
    return json
  }

  const act = async (courseId: string, action: string, extra?: Record<string, unknown>) => {
    setBusyId(courseId)
    try {
      await patchCourse({ courseId, action, ...(extra ?? {}) })
      toast({ title: "Course updated" })
      await load()
    } catch (e) {
      toast({ title: "Failed to update course", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  const savePrice = async (courseId: string) => {
    const raw = priceDrafts[courseId] ?? ""
    const parsedPrice = Number.parseInt(raw, 10)

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast({ title: "Price must be a valid non-negative number" })
      return
    }

    setBusyId(courseId)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parsedPrice }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to update course price")

      setRows((prev) => prev.map((course) => (course.id === courseId ? { ...course, price: parsedPrice } : course)))
      setPriceDrafts((prev) => ({ ...prev, [courseId]: String(parsedPrice) }))
      toast({ title: "Course price updated" })
    } catch (e) {
      toast({ title: "Failed to update course price", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground">Review course details, correct metadata, and then approve or reject submissions</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, description, instructor..." />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={featured}
              onChange={(e) => setFeatured(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">All</option>
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
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
              <EmptyTitle>No courses found</EmptyTitle>
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
                  Course
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Price
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Enrollments
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((c) => {
                const busy = busyId === c.id
                const draftPrice = Number.parseInt(priceDrafts[c.id] ?? String(c.price), 10)
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                          {c.featured ? <Star className="h-4 w-4 text-yellow-500" /> : null}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{c.instructor.name}</p>
                        {c.moderationNote ? (
                          <div className="mt-2 min-w-0 space-y-1">
                            <Badge variant="outline" className="text-[10px]">
                              Has note
                            </Badge>
                            <p className="truncate text-xs text-muted-foreground">{c.moderationNote}</p>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge kind="course" value={c.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-foreground">{c.category?.name ?? "Uncategorized"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="ml-auto flex max-w-[180px] items-center justify-end gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={priceDrafts[c.id] ?? String(c.price)}
                          onChange={(e) =>
                            setPriceDrafts((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          className="h-9 text-right tabular-nums"
                          disabled={busy}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void savePrice(c.id)}
                          disabled={busy || (priceDrafts[c.id] ?? String(c.price)) === String(c.price)}
                        >
                          Save
                        </Button>
                      </div>
                      <p className="mt-1 text-right text-xs text-muted-foreground">
                        Current: {formatUsd(Number.isFinite(draftPrice) && draftPrice >= 0 ? draftPrice : c.price)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-foreground tabular-nums">{c._count.enrollments}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/courses/${c.id}`}>
                            <FilePenLine className="mr-2 h-4 w-4" />
                            Review
                          </Link>
                        </Button>
                        {c.featured ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void act(c.id, "unfeature")}
                            disabled={busy}
                          >
                            <StarOff className="h-4 w-4 mr-2" />
                            Unfeature
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void act(c.id, "feature")}
                            disabled={busy}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Feature
                          </Button>
                        )}
                        <ConfirmDialog
                          trigger={
                            <Button variant="destructive" size="sm" disabled={busy}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          }
                          title="Delete course?"
                          description="This action is permanent. Enrollments and related data may be affected."
                          confirmText="Delete"
                          onConfirm={() => void act(c.id, "delete")}
                          disabled={busy}
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
    </>
  )
}
