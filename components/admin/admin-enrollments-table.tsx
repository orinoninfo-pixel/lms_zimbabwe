"use client"

import { useEffect, useMemo, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type EnrollmentRow = {
  id: string
  createdAt: string
  user: { id: string; name: string; email: string }
  course: { id: string; title: string; price: number; instructor: { id: string; name: string; email: string } }
  progress: { totalLessons: number; completedLessons: number; percent: number }
}

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export function AdminEnrollmentsTable() {
  const [rows, setRows] = useState<EnrollmentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [courseId, setCourseId] = useState<string>("")

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (courseId) params.set("courseId", courseId)
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [q, courseId])

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/enrollments${queryString}`, { cache: "no-store", signal }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) {
      setRows([])
      setIsLoading(false)
      setError(json?.error ?? "Failed to load enrollments")
      return
    }
    setRows((json?.enrollments ?? []) as EnrollmentRow[])
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [queryString])

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of rows) map.set(r.course.id, r.course.title)
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }))
  }, [rows])

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Enrollments</h2>
          <p className="text-sm text-muted-foreground">View student enrollments and progress</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search student, course, or instructor..."
            />
          </div>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">All courses</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
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
              <EmptyTitle>No enrollments</EmptyTitle>
              <EmptyDescription>No enrollments match the selected filters.</EmptyDescription>
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
                  Student
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Course
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Instructor
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Paid
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{r.course.title}</p>
                      <p className="text-xs text-muted-foreground lg:hidden truncate">{r.course.instructor.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{r.course.instructor.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.course.instructor.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-foreground tabular-nums">{formatUsd(r.course.price)}</td>
                  <td className="px-5 py-4">
                    <div className="space-y-2 min-w-[220px]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {r.progress.completedLessons}/{r.progress.totalLessons} lessons
                        </span>
                        <span className="font-medium text-foreground">{r.progress.percent}%</span>
                      </div>
                      <Progress value={r.progress.percent} className="h-2" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
