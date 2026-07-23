"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Edit, Plus, Trash2, Users, Video, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { toast } from "@/hooks/use-toast"
import { formatZimLevel, formatExaminingBody } from "@/lib/zim-education"

type SubjectRow = {
  id: string
  title: string
  subject: string
  grade: number
  term: number | null
  examiningBody: string
  price: number
  includesLiveLessons: boolean
  isExamPrep: boolean
  isHolidayLearning: boolean
  category: { id: string; name: string } | null
  _count: { enrollments: number; liveLessons: number }
}

export function SubjectsTable({
  apiBasePath,
  editHrefBase,
  newHref,
}: {
  apiBasePath: string
  editHrefBase: string
  newHref: string
}) {
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    const res = await fetch(apiBasePath, { cache: "no-store", signal }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    setSubjects((json?.subjects ?? []) as SubjectRow[])
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
    // apiBasePath is static per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteSubject = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`${apiBasePath}/${id}`, { method: "DELETE" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to delete subject")
      toast({ title: "Subject deleted" })
      await load()
    } catch (e) {
      toast({ title: "Failed to delete subject", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">My Subjects</h2>
          <p className="text-sm text-muted-foreground">
            ZIMSEC/Cambridge-aligned subject packages for the Zimbabwe Learning Hub
          </p>
        </div>
        <Link href={newHref}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Subject</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading subjects...</p>
        </div>
      ) : null}

      {!isLoading && subjects.length === 0 ? (
        <div className="p-6">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No subjects yet</EmptyTitle>
              <EmptyDescription>
                Create a subject package to appear in the Zimbabwe Learning Hub for students to browse.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      ) : null}

      {subjects.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Subject
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Grade / Term
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Students
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Live Lessons
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subjects.map((s) => {
                const busy = busyId === s.id
                const canDelete = s._count.enrollments === 0
                return (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[220px] lg:max-w-[320px]">
                          {s.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {s.price}/mo &middot; {s.subject}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <Badge variant="outline">{formatExaminingBody(s.examiningBody)}</Badge>
                          {s.includesLiveLessons ? <Badge variant="secondary">Live lessons</Badge> : null}
                          {s.isExamPrep ? <Badge variant="secondary">Exam prep</Badge> : null}
                          {s.isHolidayLearning ? <Badge variant="secondary">Holiday</Badge> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-sm text-muted-foreground">
                      {formatZimLevel(s.grade)}
                      {s.term ? ` · Term ${s.term}` : ""}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {s._count.enrollments}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        {s._count.liveLessons}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm" disabled={busy}>
                          <Link href={`${editHrefBase}/${s.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canDelete ? (
                          <ConfirmDialog
                            trigger={
                              <Button variant="destructive" size="sm" disabled={busy}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                            title="Delete subject?"
                            description="This permanently deletes the subject package."
                            confirmText="Delete"
                            onConfirm={() => void deleteSubject(s.id)}
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
      ) : null}
    </div>
  )
}
