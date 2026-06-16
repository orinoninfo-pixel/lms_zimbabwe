"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Star,
  Users,
  DollarSign,
  ChevronDown,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type InstructorCourse = {
  id: string
  title: string
  status: "Published" | "Draft" | "Under Review"
  students: number
  rating: number
  reviews: number
  earnings: number
  price: number
  lastUpdated: string
}

const statusColors: Record<string, string> = {
  Published: "bg-emerald-100 text-emerald-700",
  Draft: "bg-muted text-muted-foreground",
  "Under Review": "bg-amber-100 text-amber-700",
}

export function InstructorCoursesTable() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("All")
  const [courses, setCourses] = useState<InstructorCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      const res = await fetch("/api/instructor/courses", { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!cancelled) {
        setCourses(json?.courses ?? [])
        setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredCourses = useMemo(
    () => (filter === "All" ? courses : courses.filter((c) => c.status === filter)),
    [courses, filter]
  )

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">My Courses</h2>
          <p className="text-sm text-muted-foreground">Manage and track your courses</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "__filter__" ? null : "__filter__")}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
            >
              {filter}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {openDropdown === "__filter__" && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-border bg-card shadow-lg z-20">
                  {["All", "Published", "Draft", "Under Review"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilter(status)
                        setOpenDropdown(null)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link href="/instructor/courses/new">
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

      {/* Table */}
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
                Students
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                Rating
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                Earnings
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No courses yet. Click “New Course” to create one.
                </td>
              </tr>
            ) : null}
            {filteredCourses.map((course) => (
              <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-br from-accent/20 to-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Thumbnail</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate max-w-[200px] lg:max-w-[300px]">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${course.price} &middot; Updated {course.lastUpdated}
                      </p>
                      {/* Mobile status badge */}
                      <span className={cn(
                        "inline-flex md:hidden mt-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        statusColors[course.status]
                      )}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className={cn(
                    "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                    statusColors[course.status]
                  )}>
                    {course.status}
                  </span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {course.students.toLocaleString()}
                  </div>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  {course.rating > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-foreground">{course.rating}</span>
                      <span className="text-xs text-muted-foreground">({course.reviews})</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-5 py-4 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    {course.earnings > 0 ? course.earnings.toLocaleString() : "-"}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === course.id ? null : course.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                    </button>
                    {openDropdown === course.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-card shadow-lg z-20">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg">
                            <Edit className="h-4 w-4" />
                            Edit Course
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                            <Eye className="h-4 w-4" />
                            Preview
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-lg">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
