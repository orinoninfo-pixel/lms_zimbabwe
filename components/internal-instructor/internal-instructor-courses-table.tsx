"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Edit, Users, DollarSign, Plus, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/status-badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { toast } from "@/hooks/use-toast"

type InternalCourse = {
  id: string
  title: string
  price: number
  status: "draft" | "pending" | "approved" | "rejected" | "suspended"
  category: { id: string; name: string } | null
  _count: { enrollments: number; sections: number }
}

const filters = ["All", "draft", "pending", "approved", "rejected", "suspended"] as const

export function InternalInstructorCoursesTable() {
  const [courses, setCourses] = useState<InternalCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<(typeof filters)[number]>("All")
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    const res = await fetch("/api/internal-instructor/courses", { cache: "no-store", signal }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    setCourses((json?.courses ?? []) as InternalCourse[])
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [])

  const filteredCourses = useMemo(
    () => (filter === "All" ? courses : courses.filter((c) => c.status === filter)),
    [courses, filter]
  )

  const submitForApproval = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/internal-instructor/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to submit course")
      toast({ title: "Submitted for approval" })
      await load()
    } catch (e) {
      toast({ title: "Failed to submit course", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  const deleteCourse = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/internal-instructor/courses/${id}`, { method: "DELETE" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to delete course")
      toast({ title: "Course deleted" })
      await load()
    } catch (e) {
      toast({ title: "Failed to delete course", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-xs">
      <div className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">My Courses</h2>
          <p className="text-sm text-muted-foreground">Create and manage internal, platform-owned courses</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as (typeof filters)[number])}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize"
          >
            {filters.map((f) => (
              <option key={f} value={f} className="capitalize">
                {f === "All" ? "All" : f}
              </option>
            ))}
          </select>
          <Link href="/internal-instructor/courses/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Course</span>
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Course
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                Category
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                Students
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No courses yet. Click &quot;New Course&quot; to create one.
                </td>
              </tr>
            ) : null}
            {filteredCourses.map((course) => {
              const busy = busyId === course.id
              const canSubmit = course.status === "draft" || course.status === "rejected"
              const canDelete = course.status === "draft"
              return (
                <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate max-w-[220px] lg:max-w-[320px]">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {course.price}
                      </p>
                      <span className="inline-flex md:hidden mt-1">
                        <StatusBadge kind="course" value={course.status} />
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <StatusBadge kind="course" value={course.status} />
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-sm text-muted-foreground">
                    {course.category?.name ?? "Uncategorized"}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {course._count.enrollments}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm" disabled={busy}>
                        <Link href={`/internal-instructor/courses/${course.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canSubmit ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() => void submitForApproval(course.id)}
                          className="gap-2"
                        >
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Submit</span>
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <ConfirmDialog
                          trigger={
                            <Button variant="destructive" size="sm" disabled={busy}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Delete draft course?"
                          description="This permanently deletes the draft course."
                          confirmText="Delete"
                          onConfirm={() => void deleteCourse(course.id)}
                          disabled={busy}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>
    </div>
  )
}
