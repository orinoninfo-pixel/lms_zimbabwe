"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

type RecentEnrollment = {
  id: string
  studentName: string
  courseTitle: string
  amount: number
  createdAt: string
}

function initialsFor(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "?"
  )
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export function RecentEnrollments() {
  const [enrollments, setEnrollments] = useState<RecentEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setIsLoading(true)
      const res = await fetch("/api/instructor/stats", { cache: "no-store", signal: controller.signal }).catch(
        () => null
      )
      const json = res ? await res.json().catch(() => null) : null
      setEnrollments((json?.recentEnrollments ?? []) as RecentEnrollment[])
      setIsLoading(false)
    }
    void load()
    return () => controller.abort()
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card shadow-xs">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">Recent Enrollments</h2>
        <p className="text-sm text-muted-foreground">Latest students who enrolled in your courses</p>
      </div>

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : null}

      {!isLoading && enrollments.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">No enrollments yet.</p>
        </div>
      ) : null}

      <div className="divide-y divide-border">
        {enrollments.map((enrollment) => (
          <div key={enrollment.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
              {initialsFor(enrollment.studentName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{enrollment.studentName}</p>
              <p className="text-xs text-muted-foreground truncate">{enrollment.courseTitle}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-medium text-emerald-600">+${enrollment.amount}</p>
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeAgo(enrollment.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <Link
          href="/instructor/students"
          className="block w-full text-center text-sm font-medium text-primary hover:underline"
        >
          View all enrollments
        </Link>
      </div>
    </div>
  )
}
