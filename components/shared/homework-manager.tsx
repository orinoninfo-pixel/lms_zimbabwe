"use client"

import { useEffect, useState } from "react"
import { Plus, ClipboardList, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { toast } from "@/hooks/use-toast"

type AssignmentRow = {
  id: string
  title: string
  description: string | null
  dueAt: string
  subjectPackage: { id: string; title: string } | null
  _count: { submissions: number }
}

type SubmissionRow = {
  id: string
  status: "not_submitted" | "submitted" | "graded"
  answerText: string | null
  fileUrl: string | null
  feedback: string | null
  submittedAt: string | null
  student: { id: string; name: string; email: string }
}

type SubjectOption = { id: string; title: string }

const statusColors: Record<string, string> = {
  not_submitted: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-700",
  graded: "bg-emerald-100 text-emerald-700",
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function HomeworkManager({
  homeworkApiBasePath,
  subjectsApiBasePath,
}: {
  homeworkApiBasePath: string
  subjectsApiBasePath: string
}) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [subjectPackageId, setSubjectPackageId] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [submissionsOpen, setSubmissionsOpen] = useState(false)
  const [submissionsAssignmentId, setSubmissionsAssignmentId] = useState<string | null>(null)
  const [submissionsAssignmentTitle, setSubmissionsAssignmentTitle] = useState("")
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})
  const [gradingId, setGradingId] = useState<string | null>(null)

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    const [assignmentsRes, subjectsRes] = await Promise.all([
      fetch(homeworkApiBasePath, { cache: "no-store", signal }).catch(() => null),
      fetch(subjectsApiBasePath, { cache: "no-store", signal }).catch(() => null),
    ])
    const assignmentsJson = assignmentsRes ? await assignmentsRes.json().catch(() => null) : null
    const subjectsJson = subjectsRes ? await subjectsRes.json().catch(() => null) : null

    setAssignments((assignmentsJson?.assignments ?? []) as AssignmentRow[])
    setSubjects(((subjectsJson?.subjects ?? []) as Array<{ id: string; title: string }>).map((s) => ({ id: s.id, title: s.title })))
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
    // base paths are static per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setTitle("")
    setDescription("")
    setDueAt("")
    setSubjectPackageId("")
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (assignment: AssignmentRow) => {
    setEditingId(assignment.id)
    setTitle(assignment.title)
    setDescription(assignment.description ?? "")
    setDueAt(toLocalInputValue(assignment.dueAt))
    setSubjectPackageId(assignment.subjectPackage?.id ?? "")
    setFormError(null)
    setDialogOpen(true)
  }

  const save = async () => {
    setFormError(null)
    if (!title.trim() || !dueAt) {
      setFormError("Add a title and a due date/time.")
      return
    }
    if (!editingId && !subjectPackageId) {
      setFormError("Choose which subject this homework belongs to.")
      return
    }

    setSaving(true)
    try {
      const isoDueAt = new Date(dueAt).toISOString()

      if (editingId) {
        const res = await fetch(`${homeworkApiBasePath}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() ? description.trim() : null,
            dueAt: isoDueAt,
          }),
        }).catch(() => null)
        const json = res ? await res.json().catch(() => null) : null
        if (!res || !res.ok) throw new Error(json?.error ?? "Failed to save homework")
      } else {
        const res = await fetch(homeworkApiBasePath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() ? description.trim() : undefined,
            dueAt: isoDueAt,
            subjectPackageId,
          }),
        }).catch(() => null)
        const json = res ? await res.json().catch(() => null) : null
        if (!res || !res.ok) throw new Error(json?.error ?? "Failed to create homework")
      }

      toast({ title: editingId ? "Homework updated" : "Homework assigned" })
      setDialogOpen(false)
      await load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setSaving(false)
    }
  }

  const deleteAssignment = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`${homeworkApiBasePath}/${id}`, { method: "DELETE" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to delete homework")
      toast({ title: "Homework deleted" })
      await load()
    } catch (e) {
      toast({ title: "Failed to delete homework", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  const openSubmissions = async (assignment: AssignmentRow) => {
    setSubmissionsAssignmentId(assignment.id)
    setSubmissionsAssignmentTitle(assignment.title)
    setSubmissionsOpen(true)
    setSubmissionsLoading(true)
    const res = await fetch(`${homeworkApiBasePath}/${assignment.id}`, { cache: "no-store" }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    const rows = (json?.assignment?.submissions ?? []) as SubmissionRow[]
    setSubmissions(rows)
    setFeedbackDrafts(Object.fromEntries(rows.map((r) => [r.id, r.feedback ?? ""])))
    setSubmissionsLoading(false)
  }

  const gradeSubmission = async (submissionId: string) => {
    if (!submissionsAssignmentId) return
    setGradingId(submissionId)
    try {
      const res = await fetch(`${homeworkApiBasePath}/${submissionsAssignmentId}/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackDrafts[submissionId] ?? "", status: "graded" }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to grade submission")
      setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, ...json.submission } : s)))
      toast({ title: "Submission graded" })
      await load()
    } catch (e) {
      toast({ title: "Failed to grade submission", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setGradingId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Homework</h2>
          <p className="text-sm text-muted-foreground">Assign homework to your subjects and grade submissions</p>
        </div>
        <Button onClick={openCreate} className="gap-2" disabled={subjects.length === 0}>
          <Plus className="h-4 w-4" />
          Assign Homework
        </Button>
      </div>

      {subjects.length === 0 && !isLoading ? (
        <div className="p-5 border-b border-border">
          <p className="text-sm text-muted-foreground">Create a subject first — homework must be linked to one.</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading homework...</p>
        </div>
      ) : null}

      {!isLoading && assignments.length === 0 ? (
        <div className="p-6">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No homework assigned</EmptyTitle>
              <EmptyDescription>Assign your first homework for a subject.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      ) : null}

      {assignments.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Assignment
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Due
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Submissions
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map((assignment) => {
                const busy = busyId === assignment.id
                return (
                  <tr key={assignment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground truncate max-w-[220px] lg:max-w-[320px]">
                        {assignment.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {assignment.subjectPackage ? `Subject — ${assignment.subjectPackage.title}` : null}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(assignment.dueAt).toLocaleString("en-ZW", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline">{assignment._count.submissions}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" size="sm" disabled={busy} onClick={() => void openSubmissions(assignment)}>
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Submissions
                        </Button>
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => openEdit(assignment)}>
                          Edit
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="destructive" size="sm" disabled={busy}>
                              Delete
                            </Button>
                          }
                          title="Delete homework?"
                          description="This permanently deletes the homework assignment and its submissions."
                          confirmText="Delete"
                          onConfirm={() => void deleteAssignment(assignment.id)}
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
            <DialogTitle>{editingId ? "Edit homework" : "Assign homework"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="homework-title">Title</Label>
              <Input
                id="homework-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chapter 4 exercises"
              />
            </div>

            {!editingId ? (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subjectPackageId} onValueChange={setSubjectPackageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="homework-due">Due at</Label>
              <Input id="homework-due" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homework-description">Description (optional)</Label>
              <Textarea
                id="homework-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the homework task..."
              />
            </div>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {editingId ? "Save Changes" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={submissionsOpen} onOpenChange={setSubmissionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submissions</DialogTitle>
            <DialogDescription>{submissionsAssignmentTitle}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {submissionsLoading ? <p className="text-sm text-muted-foreground">Loading submissions...</p> : null}

            {!submissionsLoading && submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students have submitted yet.</p>
            ) : null}

            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{submission.student.name}</p>
                    <p className="text-xs text-muted-foreground">{submission.student.email}</p>
                  </div>
                  <Badge className={statusColors[submission.status]}>{submission.status.replace("_", " ")}</Badge>
                </div>

                {submission.answerText ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap rounded-md bg-muted/30 p-3">
                    {submission.answerText}
                  </p>
                ) : null}
                {submission.fileUrl ? (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-accent hover:underline"
                  >
                    View submitted file
                  </a>
                ) : null}

                {submission.status !== "not_submitted" ? (
                  <div className="space-y-2">
                    <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                    <Textarea
                      id={`feedback-${submission.id}`}
                      value={feedbackDrafts[submission.id] ?? ""}
                      onChange={(e) =>
                        setFeedbackDrafts((prev) => ({ ...prev, [submission.id]: e.target.value }))
                      }
                      placeholder="Add feedback for this student..."
                    />
                    <Button
                      size="sm"
                      onClick={() => void gradeSubmission(submission.id)}
                      disabled={gradingId === submission.id}
                    >
                      {submission.status === "graded" ? "Update grade" : "Mark graded"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmissionsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
