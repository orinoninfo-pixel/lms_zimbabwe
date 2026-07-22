"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Video, Clock, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { toast } from "@/hooks/use-toast"

type LessonRow = {
  id: string
  title: string
  status: "upcoming" | "completed" | "canceled"
  startsAt: string
  durationMinutes: number
  meetingLink: string | null
  recordingUrl: string | null
  subjectPackage: { id: string; title: string } | null
  course: { id: string; title: string } | null
}

type SubjectOption = { id: string; title: string }
type CourseOption = { id: string; title: string }

const statusColors: Record<string, string> = {
  upcoming: "bg-emerald-100 text-emerald-700",
  completed: "bg-muted text-muted-foreground",
  canceled: "bg-rose-100 text-rose-700",
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function LiveLessonsManager({
  lessonsApiBasePath,
  subjectsApiBasePath,
  coursesApiBasePath,
}: {
  lessonsApiBasePath: string
  subjectsApiBasePath: string
  coursesApiBasePath: string
}) {
  const [lessons, setLessons] = useState<LessonRow[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [linkValue, setLinkValue] = useState<string>("")
  const [startsAt, setStartsAt] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("60")
  const [meetingLink, setMeetingLink] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    const [lessonsRes, subjectsRes, coursesRes] = await Promise.all([
      fetch(lessonsApiBasePath, { cache: "no-store", signal }).catch(() => null),
      fetch(subjectsApiBasePath, { cache: "no-store", signal }).catch(() => null),
      fetch(coursesApiBasePath, { cache: "no-store", signal }).catch(() => null),
    ])
    const lessonsJson = lessonsRes ? await lessonsRes.json().catch(() => null) : null
    const subjectsJson = subjectsRes ? await subjectsRes.json().catch(() => null) : null
    const coursesJson = coursesRes ? await coursesRes.json().catch(() => null) : null

    setLessons((lessonsJson?.lessons ?? []) as LessonRow[])
    setSubjects(((subjectsJson?.subjects ?? []) as Array<{ id: string; title: string }>).map((s) => ({ id: s.id, title: s.title })))
    setCourses(((coursesJson?.courses ?? []) as Array<{ id: string; title: string }>).map((c) => ({ id: c.id, title: c.title })))
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
    // base paths are static per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const linkOptions = useMemo(
    () => [
      ...subjects.map((s) => ({ value: `subject:${s.id}`, label: `Subject — ${s.title}` })),
      ...courses.map((c) => ({ value: `course:${c.id}`, label: `Course — ${c.title}` })),
    ],
    [subjects, courses]
  )

  const openCreate = () => {
    setEditingId(null)
    setTitle("")
    setLinkValue("")
    setStartsAt("")
    setDurationMinutes("60")
    setMeetingLink("")
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (lesson: LessonRow) => {
    setEditingId(lesson.id)
    setTitle(lesson.title)
    setLinkValue("")
    setStartsAt(toLocalInputValue(lesson.startsAt))
    setDurationMinutes(String(lesson.durationMinutes))
    setMeetingLink(lesson.meetingLink ?? "")
    setFormError(null)
    setDialogOpen(true)
  }

  const save = async () => {
    setFormError(null)
    if (!title.trim() || !startsAt) {
      setFormError("Add a title and a start date/time.")
      return
    }
    if (!editingId && !linkValue) {
      setFormError("Choose which subject or course this live lesson belongs to.")
      return
    }

    setSaving(true)
    try {
      const isoStartsAt = new Date(startsAt).toISOString()
      const duration = Number.parseInt(durationMinutes, 10)

      if (editingId) {
        const res = await fetch(`${lessonsApiBasePath}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            startsAt: isoStartsAt,
            durationMinutes: Number.isFinite(duration) ? duration : 60,
            meetingLink: meetingLink.trim() ? meetingLink.trim() : null,
          }),
        }).catch(() => null)
        const json = res ? await res.json().catch(() => null) : null
        if (!res || !res.ok) throw new Error(json?.error ?? "Failed to save live lesson")
      } else {
        const [kind, id] = linkValue.split(":")
        const res = await fetch(lessonsApiBasePath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            startsAt: isoStartsAt,
            durationMinutes: Number.isFinite(duration) ? duration : 60,
            meetingLink: meetingLink.trim() ? meetingLink.trim() : undefined,
            ...(kind === "subject" ? { subjectPackageId: id } : { courseId: id }),
          }),
        }).catch(() => null)
        const json = res ? await res.json().catch(() => null) : null
        if (!res || !res.ok) throw new Error(json?.error ?? "Failed to schedule live lesson")
      }

      toast({ title: editingId ? "Live lesson updated" : "Live lesson scheduled" })
      setDialogOpen(false)
      await load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id: string, status: "completed" | "canceled" | "upcoming") => {
    setBusyId(id)
    try {
      const res = await fetch(`${lessonsApiBasePath}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to update status")
      toast({ title: "Live lesson updated" })
      await load()
    } catch (e) {
      toast({ title: "Failed to update live lesson", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  const deleteLesson = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`${lessonsApiBasePath}/${id}`, { method: "DELETE" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to delete live lesson")
      toast({ title: "Live lesson deleted" })
      await load()
    } catch (e) {
      toast({ title: "Failed to delete live lesson", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Live Lessons</h2>
          <p className="text-sm text-muted-foreground">Schedule live sessions for your subjects and courses</p>
        </div>
        <Button onClick={openCreate} className="gap-2" disabled={subjects.length === 0 && courses.length === 0}>
          <Plus className="h-4 w-4" />
          Schedule Live Lesson
        </Button>
      </div>

      {subjects.length === 0 && courses.length === 0 && !isLoading ? (
        <div className="p-5 border-b border-border">
          <p className="text-sm text-muted-foreground">
            Create a subject or a course first — live lessons must be linked to one of them.
          </p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading live lessons...</p>
        </div>
      ) : null}

      {!isLoading && lessons.length === 0 ? (
        <div className="p-6">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No live lessons scheduled</EmptyTitle>
              <EmptyDescription>Schedule your first live session for a subject or course.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      ) : null}

      {lessons.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Lesson
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  When
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lessons.map((lesson) => {
                const busy = busyId === lesson.id
                const when = new Date(lesson.startsAt)
                return (
                  <tr key={lesson.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[220px] lg:max-w-[320px]">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {lesson.subjectPackage ? `Subject — ${lesson.subjectPackage.title}` : null}
                          {lesson.course ? `Course — ${lesson.course.title}` : null}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex md:hidden">
                            <Badge className={statusColors[lesson.status]}>{lesson.status}</Badge>
                          </span>
                          {lesson.meetingLink ? (
                            <a
                              href={lesson.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                            >
                              <LinkIcon className="h-3 w-3" />
                              Meeting link
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge className={statusColors[lesson.status]}>{lesson.status}</Badge>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {when.toLocaleString("en-ZW", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      <p className="text-xs">{lesson.durationMinutes} min</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => openEdit(lesson)}>
                          Edit
                        </Button>
                        {lesson.status === "upcoming" ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={busy}
                              onClick={() => void setStatus(lesson.id, "completed")}
                            >
                              Mark done
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => void setStatus(lesson.id, "canceled")}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : null}
                        <ConfirmDialog
                          trigger={
                            <Button variant="destructive" size="sm" disabled={busy}>
                              Delete
                            </Button>
                          }
                          title="Delete live lesson?"
                          description="This permanently deletes the scheduled live lesson."
                          confirmText="Delete"
                          onConfirm={() => void deleteLesson(lesson.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit live lesson" : "Schedule live lesson"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Title</Label>
              <Input
                id="lesson-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Live Q&A: Algebra Revision"
              />
            </div>

            {!editingId ? (
              <div className="space-y-2">
                <Label>Link to</Label>
                <Select value={linkValue} onValueChange={setLinkValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject or course" />
                  </SelectTrigger>
                  <SelectContent>
                    {linkOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lesson-starts">Starts at</Label>
                <Input
                  id="lesson-starts"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  min="5"
                  max="480"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-link">Meeting link (optional)</Label>
              <Input
                id="lesson-link"
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Only shown to students enrolled in the linked subject or course.
              </p>
            </div>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving} className="gap-2">
              <Video className="h-4 w-4" />
              {editingId ? "Save Changes" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
