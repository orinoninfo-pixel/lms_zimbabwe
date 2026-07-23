"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Eye, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/admin/status-badge"
import { toast } from "@/hooks/use-toast"
import { ZIM_LEVELS, EXAMINING_BODIES, formatZimLevel } from "@/lib/zim-education"

type Category = { id: string; name: string }
type PendingSubjectNavItem = { id: string; title: string }

type ReviewSubject = {
  id: string
  title: string
  description: string
  moderationNote: string | null
  price: number
  grade: number
  examiningBody: string
  status: "draft" | "pending" | "approved" | "rejected" | "suspended"
  createdAt: string
  updatedAt: string
  teacher: { id: string; name: string; email: string } | null
  category: { id: string; name: string } | null
  sections: Array<{
    id: string
    title: string
    order: number
    lessons: Array<{ id: string; title: string; videoUrl: string; order: number }>
  }>
  _count: {
    enrollments: number
    liveLessons: number
    homework: number
  }
}

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export function AdminSubjectReviewPage({ subjectId }: { subjectId: string }) {
  const router = useRouter()
  const [subject, setSubject] = useState<ReviewSubject | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [pendingQueue, setPendingQueue] = useState<PendingSubjectNavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [moderationNote, setModerationNote] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [examiningBody, setExaminingBody] = useState("zimsec")
  const parsedDraftPrice = Number.parseInt(price, 10)

  const publicLink = useMemo(() => (subject ? `/zimbabwe-learning-hub/${subject.id}` : "#"), [subject])
  const totalLessons = useMemo(
    () => (subject ? subject.sections.reduce((sum, section) => sum + section.lessons.length, 0) : 0),
    [subject]
  )
  const hasCategory = Boolean(categoryId || subject?.category?.id)
  const learnerAccessible = Boolean(subject && subject.status === "approved")
  const approvalChecks = useMemo(
    () => [
      { label: "Title is present", ok: Boolean(title.trim()) },
      { label: "Description is present", ok: Boolean(description.trim()) },
      { label: "Category is assigned", ok: hasCategory },
      { label: "Price is set", ok: Number.isFinite(parsedDraftPrice) && parsedDraftPrice > 0 },
    ],
    [description, hasCategory, parsedDraftPrice, title]
  )
  const approvalReady = approvalChecks.every((check) => check.ok)
  const missingChecks = approvalChecks.filter((check) => !check.ok)
  const currentPendingIndex = useMemo(
    () => pendingQueue.findIndex((pendingSubject) => pendingSubject.id === subjectId),
    [subjectId, pendingQueue]
  )
  const previousPendingSubject = currentPendingIndex > 0 ? pendingQueue[currentPendingIndex - 1] : null
  const nextPendingSubject =
    currentPendingIndex >= 0 && currentPendingIndex < pendingQueue.length - 1 ? pendingQueue[currentPendingIndex + 1] : null

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      const [subjectRes, categoriesRes, pendingRes] = await Promise.all([
        fetch(`/api/admin/subjects/${subjectId}`, { cache: "no-store" }).catch(() => null),
        fetch("/api/admin/categories", { cache: "no-store" }).catch(() => null),
        fetch("/api/admin/subjects?status=pending", { cache: "no-store" }).catch(() => null),
      ])

      const subjectJson = subjectRes ? await subjectRes.json().catch(() => null) : null
      const categoriesJson = categoriesRes ? await categoriesRes.json().catch(() => null) : null
      const pendingJson = pendingRes ? await pendingRes.json().catch(() => null) : null

      if (cancelled) return

      if (!subjectRes || !subjectRes.ok) {
        setSubject(null)
        setError(subjectJson?.error ?? "Failed to load subject details")
        setIsLoading(false)
        return
      }

      const nextSubject = subjectJson?.subject as ReviewSubject
      setSubject(nextSubject)
      setCategories(((categoriesJson?.categories ?? []) as Category[]) ?? [])
      setPendingQueue(
        (((pendingJson?.subjects ?? []) as Array<{ id: string; title: string }>) ?? []).map((pendingSubject) => ({
          id: pendingSubject.id,
          title: pendingSubject.title,
        }))
      )
      setTitle(nextSubject.title)
      setDescription(nextSubject.description)
      setModerationNote(nextSubject.moderationNote ?? "")
      setPrice(String(nextSubject.price))
      setCategoryId(nextSubject.category?.id ?? "")
      setExaminingBody(nextSubject.examiningBody ?? "zimsec")
      setIsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [subjectId])

  const save = async (nextStatus?: ReviewSubject["status"]) => {
    const parsedPrice = Number.parseInt(price, 10)

    if (!title.trim()) {
      toast({ title: "Title is required" })
      return
    }
    if (!description.trim()) {
      toast({ title: "Description is required" })
      return
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast({ title: "Price must be a valid non-negative number" })
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          moderationNote: moderationNote.trim() ? moderationNote.trim() : null,
          price: parsedPrice,
          categoryId: categoryId || null,
          examiningBody,
          ...(nextStatus ? { status: nextStatus } : {}),
        }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to save subject")

      const updated = json?.subject as ReviewSubject
      setSubject((prev) => (prev ? { ...prev, ...updated } : updated))
      setPendingQueue((prev) =>
        nextStatus && nextStatus !== "pending"
          ? prev.filter((pendingSubject) => pendingSubject.id !== subjectId)
          : prev
      )
      toast({ title: nextStatus ? "Subject reviewed" : "Subject details saved" })
    } catch (e) {
      toast({ title: "Failed to save subject", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="h-auto px-0 text-muted-foreground">
            <Link href="/admin/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to subjects
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Subject</h1>
            <p className="text-sm text-muted-foreground">
              Review subject content, correct pricing and metadata, then moderate publication.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              Pending queue:{" "}
              {currentPendingIndex >= 0
                ? `${currentPendingIndex + 1} of ${pendingQueue.length}`
                : `${pendingQueue.length} pending submission${pendingQueue.length === 1 ? "" : "s"}`}
            </span>
            {currentPendingIndex >= 0 ? <Badge variant="outline">Current subject is pending</Badge> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => previousPendingSubject && router.push(`/admin/subjects/${previousPendingSubject.id}`)}
            disabled={!previousPendingSubject || isSaving}
            title={previousPendingSubject ? previousPendingSubject.title : "No earlier pending subject"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Pending
          </Button>
          <Button
            variant="outline"
            onClick={() => nextPendingSubject && router.push(`/admin/subjects/${nextPendingSubject.id}`)}
            disabled={!nextPendingSubject || isSaving}
            title={nextPendingSubject ? nextPendingSubject.title : "No later pending subject"}
          >
            Next Pending
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => void save("rejected")} disabled={isSaving || !subject}>
            Reject
          </Button>
          <Button variant="outline" onClick={() => void save("suspended")} disabled={isSaving || !subject}>
            Suspend
          </Button>
          <Button variant="secondary" onClick={() => void save()} disabled={isSaving || !subject}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={() => void save("approved")} disabled={isSaving || !subject || !approvalReady}>
            Save and Approve
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Loading subject details...</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {subject ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusBadge kind="subject" value={subject.status} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Students</p>
              <p className="mt-2 text-sm font-medium text-foreground">{subject._count.enrollments}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Level</p>
              <p className="mt-2 text-sm font-medium text-foreground">{formatZimLevel(subject.grade)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {Number.isFinite(parsedDraftPrice) && parsedDraftPrice >= 0
                  ? formatUsd(parsedDraftPrice)
                  : formatUsd(subject.price)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_380px]">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Subject Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Review and refine the learner-facing information before publishing.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-subject-title">Title</Label>
                    <Input id="admin-subject-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-subject-description">Description</Label>
                    <Textarea
                      id="admin-subject-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-48"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Internal Moderation Notes</h2>
                  <p className="text-sm text-muted-foreground">
                    Record internal comments, requested corrections, and rejection reasons.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-subject-moderation-note">Moderation note</Label>
                  <Textarea
                    id="admin-subject-moderation-note"
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    className="min-h-40"
                    placeholder="Add internal review notes or a rejection reason for this subject."
                  />
                  <p className="text-xs text-muted-foreground">
                    This note is only for admins and is also shown to the tutor when a subject is rejected.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      {subject.status === "approved" ? (
                        <Eye className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-amber-600" />
                      )}
                      <p className="text-sm font-semibold text-foreground">Public Visibility</p>
                    </div>
                    <div className="mt-3">
                      <Badge variant={subject.status === "approved" ? "default" : "outline"}>
                        {subject.status === "approved" ? "Visible to learners" : "Hidden from public learners"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {subject.status === "approved"
                        ? "This subject can appear on the Zimbabwe Learning Hub."
                        : "Only admins and the tutor can preview this subject."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      {learnerAccessible ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <p className="text-sm font-semibold text-foreground">Learner Access</p>
                    </div>
                    <div className="mt-3">
                      <Badge variant={learnerAccessible ? "default" : "outline"}>
                        {learnerAccessible ? "Subject is learner-ready" : "Learner access is blocked"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {learnerAccessible
                        ? "Learners can subscribe to and access this subject."
                        : "Learner access requires admin approval."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      {approvalReady ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <p className="text-sm font-semibold text-foreground">Approval Readiness</p>
                    </div>
                    <div className="mt-3">
                      <Badge variant={approvalReady ? "default" : "outline"}>
                        {approvalReady ? "Ready for approval" : "Needs attention"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {approvalReady
                        ? "Core metadata is complete."
                        : "Review the checklist below before approving this subject."}
                    </p>
                  </div>
                </div>

                {approvalReady ? (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Ready for approval</AlertTitle>
                    <AlertDescription>
                      This subject has the core metadata needed for approval.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-amber-200 bg-amber-50 text-amber-950 [&>svg]:text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Approval checklist incomplete</AlertTitle>
                    <AlertDescription>
                      {missingChecks.map((check) => (
                        <p key={check.label}>Missing: {check.label}</p>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Curriculum</h2>
                    <p className="text-sm text-muted-foreground">Inspect sections and lessons, if any.</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{totalLessons} lessons</p>
                </div>
                <div className="mt-4 space-y-3">
                  {subject.sections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      This subject has no curriculum — it relies on live lessons, homework, and exam resources instead.
                    </p>
                  ) : (
                    subject.sections.map((section) => (
                      <div key={section.id} className="rounded-lg border border-border bg-muted/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{section.title}</p>
                          <p className="text-xs text-muted-foreground">{section.lessons.length} lessons</p>
                        </div>
                        <div className="mt-3 space-y-2">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="rounded-md bg-background px-3 py-2 text-sm text-muted-foreground"
                            >
                              {lesson.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 self-start xl:sticky xl:top-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Publishing Controls</h2>
                  <p className="text-sm text-muted-foreground">
                    Adjust pricing, category, and examining body before moderation.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-subject-price">Price (USD / month)</Label>
                    <Input
                      id="admin-subject-price"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-11 text-base font-medium"
                    />
                    <p className="text-xs text-muted-foreground">Set the learner-facing monthly price.</p>
                    <p className="text-sm font-medium text-foreground">
                      Live preview:{" "}
                      {Number.isFinite(parsedDraftPrice) && parsedDraftPrice >= 0
                        ? formatUsd(parsedDraftPrice)
                        : "Enter a valid price"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-subject-category">Category</Label>
                    <select
                      id="admin-subject-category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-subject-examining-body">Examining Body</Label>
                    <select
                      id="admin-subject-examining-body"
                      value={examiningBody}
                      onChange={(e) => setExaminingBody(e.target.value)}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      {EXAMINING_BODIES.map((body) => (
                        <option key={body.value} value={body.value}>
                          {body.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Grade/Form ({ZIM_LEVELS.find((l) => l.value === subject.grade)?.label ?? subject.grade}) is set by
                    the tutor and can't be changed here.
                  </p>
                </div>

                <Separator className="my-5" />

                <div className="flex flex-col gap-2">
                  <Button variant="secondary" onClick={() => void save()} disabled={isSaving || !subject}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button onClick={() => void save("approved")} disabled={isSaving || !subject || !approvalReady}>
                    Save and Approve
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => void save("rejected")} disabled={isSaving || !subject}>
                      Reject
                    </Button>
                    <Button variant="outline" onClick={() => void save("suspended")} disabled={isSaving || !subject}>
                      Suspend
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Tutor</p>
                <p className="mt-2 text-sm text-foreground">{subject.teacher?.name ?? "Unassigned"}</p>
                <p className="text-xs text-muted-foreground">{subject.teacher?.email ?? ""}</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Pending Queue</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {currentPendingIndex >= 0 ? (
                    <p>
                      Reviewing pending submission {currentPendingIndex + 1} of {pendingQueue.length}.
                    </p>
                  ) : (
                    <p>This subject is not currently in the pending queue.</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previousPendingSubject && router.push(`/admin/subjects/${previousPendingSubject.id}`)}
                      disabled={!previousPendingSubject || isSaving}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => nextPendingSubject && router.push(`/admin/subjects/${nextPendingSubject.id}`)}
                      disabled={!nextPendingSubject || isSaving}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Review Notes</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>Created: {new Date(subject.createdAt).toLocaleString("en-ZW")}</p>
                  <p>Updated: {new Date(subject.updatedAt).toLocaleString("en-ZW")}</p>
                  <p>Live lessons: {subject._count.liveLessons}</p>
                  <p>Homework assignments: {subject._count.homework}</p>
                </div>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href={publicLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Subject Preview
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
