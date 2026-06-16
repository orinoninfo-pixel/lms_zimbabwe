"use client"

import { useEffect, useMemo, useState } from "react"
import { Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type StudentRow = {
  courseId: string
  courseTitle: string
  userId: string
  studentName: string
  studentEmail: string
  completedLessons: number
  totalLessons: number
  percent: number
}

export function InstructorStudentsTable() {
  const [rows, setRows] = useState<StudentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [courseFilter, setCourseFilter] = useState<string>("All")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      const res = await fetch("/api/instructor/students", { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!cancelled) {
        setRows(json?.rows ?? [])
        setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const courseOptions = useMemo(() => {
    const titles = new Map<string, string>()
    for (const r of rows) titles.set(r.courseId, r.courseTitle)
    return Array.from(titles.entries()).map(([id, title]) => ({ id, title }))
  }, [rows])

  const filtered = useMemo(
    () => (courseFilter === "All" ? rows : rows.filter((r) => r.courseId === courseFilter)),
    [rows, courseFilter]
  )

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">Learners enrolled in your courses</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="All">All courses</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading students...</p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Student
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Course
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No enrollments yet.
                </td>
              </tr>
            ) : null}
            {filtered.map((row) => (
              <tr key={`${row.courseId}-${row.userId}`} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/50 text-accent-foreground text-sm font-semibold">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{row.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">{row.studentEmail}</p>
                      <p className="text-xs text-muted-foreground md:hidden mt-0.5 truncate">
                        {row.courseTitle}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-sm text-foreground">{row.courseTitle}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-2 min-w-[220px]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {row.completedLessons}/{row.totalLessons} lessons
                      </span>
                      <span className="font-medium text-foreground">{row.percent}%</span>
                    </div>
                    <Progress value={row.percent} className="h-2" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

