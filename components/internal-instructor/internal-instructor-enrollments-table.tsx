"use client"

import { useEffect, useState } from "react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type EnrollmentRow = {
  id: string
  createdAt: string
  user: { id: string; name: string; email: string }
  course: { id: string; title: string; price: number; status: string }
  progress: { totalLessons: number; completedLessons: number; percent: number }
}

export function InternalInstructorEnrollmentsTable() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/internal-instructor/enrollments", {
        cache: "no-store",
        signal: controller.signal,
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) {
        setEnrollments([])
        setError(json?.error ?? "Failed to load enrollments")
        setIsLoading(false)
        return
      }
      setEnrollments((json?.enrollments ?? []) as EnrollmentRow[])
      setIsLoading(false)
    }
    void load()
    return () => controller.abort()
  }, [])

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Enrollments</h2>
        <p className="text-sm text-muted-foreground">Student counts and progress across your internal courses</p>
      </div>

      {error ? <p className="px-5 py-4 text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : null}

      {!isLoading && enrollments.length === 0 ? (
        <div className="p-6">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No enrollments yet</EmptyTitle>
              <EmptyDescription>Once students enroll in your courses, they&apos;ll show up here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      ) : null}

      {enrollments.length ? (
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
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Enrolled
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground">{e.user.name}</p>
                    <p className="text-xs text-muted-foreground">{e.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">{e.course.title}</td>
                  <td className="px-5 py-4 hidden md:table-cell text-sm text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString("en-ZW")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${e.progress.percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">{e.progress.percent}%</span>
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
