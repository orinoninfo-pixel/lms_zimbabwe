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

type Category = { id: string; name: string }
type PendingCourseNavItem = { id: string; title: string }

type ReviewCourse = {
  id: string
  title: string
  description: string
  moderationNote: string | null
  price: number
  status: "draft" | "pending" | "approved" | "rejected" | "suspended"
  featured: boolean
  createdAt: string
  updatedAt: string
  instructor: { id: string; name: string; email: string }
  category: { id: string; name: string } | null
  sections: Array<{
    id: string
    title: string
    order: number
    lessons: Array<{ id: string; title: string; videoUrl: string; order: number }>
  }>
  _count: {
    enrollments: number
    sections: number
    favorites: number
    reports: number
  }
}

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export function AdminCourseReviewPage({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [course, setCourse] = useState<ReviewCourse | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [pendingQueue, setPendingQueue] = useState<PendingCourseNavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [moderationNote, setModerationNote] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [featured, setFeatured] = useState(false)
  const parsedDraftPrice = Number.parseInt(price, 10)

  const publicLink = useMemo(() => (course ? `/course/${course.id}?adminPreview=1` : "#"), [course])
  const totalLessons = useMemo(
    () => (course ? course.sections.reduce((sum, section) => sum + section.lessons.length, 0) : 0),
    [course]
  )
  const hasCategory = Boolean(categoryId || course?.category?.id)
  const hasContent = course ? course.sections.length > 0 && totalLessons > 0 : false
  const learnerAccessible = Boolean(course && course.status === "approved" && hasContent)
  const approvalChecks = useMemo(
    () => [
      { label: "Title is present", ok: Boolean(title.trim()) },
      { label: "Description is present", ok: Boolean(description.trim()) },
      { label: "Category is assigned", ok: hasCategory },
      { label: "At least one section exists", ok: Boolean(course && course.sections.length > 0) },
      { label: "At least one lesson exists", ok: totalLessons > 0 },
    ],
    [course, description, hasCategory, title, totalLessons]
  )
  const approvalReady = approvalChecks.every((check) => check.ok)
  const missingChecks = approvalChecks.filter((check) => !check.ok)
  const currentPendingIndex = useMemo(
    () => pendingQueue.findIndex((pendingCourse) => pendingCourse.id === courseId),
    [courseId, pendingQueue]
  )
  const previousPendingCourse = currentPendingIndex > 0 ? pendingQueue[currentPendingIndex - 1] : null
  const nextPendingCourse =
    currentPendingIndex >= 0 && currentPendingIndex < pendingQueue.length - 1 ? pendingQueue[currentPendingIndex + 1] : null

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      const [courseRes, categoriesRes, pendingRes] = await Promise.all([
        fetch(`/api/admin/courses/${courseId}`, { cache: "no-store" }).catch(() => null),
        fetch("/api/admin/categories", { cache: "no-store" }).catch(() => null),
        fetch("/api/admin/courses?status=pending", { cache: "no-store" }).catch(() => null),
      ])

      const courseJson = courseRes ? await courseRes.json().catch(() => null) : null
      const categoriesJson = categoriesRes ? await categoriesRes.json().catch(() => null) : null
      const pendingJson = pendingRes ? await pendingRes.json().catch(() => null) : null

      if (cancelled) return

      if (!courseRes || !courseRes.ok) {
        setCourse(null)
        setError(courseJson?.error ?? "Failed to load course details")
        setIsLoading(false)
        return
      }

      const nextCourse = courseJson?.course as ReviewCourse
      setCourse(nextCourse)
      setCategories(((categoriesJson?.categories ?? []) as Category[]) ?? [])
      setPendingQueue(
        (((pendingJson?.courses ?? []) as Array<{ id: string; title: string }>) ?? []).map((pendingCourse) => ({
          id: pendingCourse.id,
          title: pendingCourse.title,
        }))
      )
      setTitle(nextCourse.title)
      setDescription(nextCourse.description)
      setModerationNote(nextCourse.moderationNote ?? "")
      setPrice(String(nextCourse.price))
      setCategoryId(nextCourse.category?.id ?? "")
      setFeatured(nextCourse.featured)
      setIsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [courseId])

  const save = async (nextStatus?: ReviewCourse["status"]) => {
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
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          moderationNote: moderationNote.trim() ? moderationNote.trim() : null,
          price: parsedPrice,
          categoryId: categoryId || null,
          featured,
          ...(nextStatus ? { status: nextStatus } : {}),
        }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to save course")

      const updated = json?.course as ReviewCourse
      setCourse((prev) => (prev ? { ...prev, ...updated } : updated))
      setPendingQueue((prev) =>
        nextStatus && nextStatus !== "pending"
          ? prev.filter((pendingCourse) => pendingCourse.id !== courseId)
          : prev
      )
      toast({ title: nextStatus ? "Course reviewed" : "Course details saved" })
    } catch (e) {
      toast({ title: "Failed to save course", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="h-auto px-0 text-muted-foreground">
            <Link href="/admin/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to courses
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Course</h1>
            <p className="text-sm text-muted-foreground">
              Review course content, correct pricing and metadata, then moderate publication.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              Pending queue:{" "}
              {currentPendingIndex >= 0
                ? `${currentPendingIndex + 1} of ${pendingQueue.length}`
                : `${pendingQueue.length} pending submission${pendingQueue.length === 1 ? "" : "s"}`}
            </span>
            {currentPendingIndex >= 0 ? <Badge variant="outline">Current course is pending</Badge> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => previousPendingCourse && router.push(`/admin/courses/${previousPendingCourse.id}`)}
            disabled={!previousPendingCourse || isSaving}
            title={previousPendingCourse ? previousPendingCourse.title : "No earlier pending course"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Pending
          </Button>
          <Button
            variant="outline"
            onClick={() => nextPendingCourse && router.push(`/admin/courses/${nextPendingCourse.id}`)}
            disabled={!nextPendingCourse || isSaving}
            title={nextPendingCourse ? nextPendingCourse.title : "No later pending course"}
          >
            Next Pending
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => void save("rejected")} disabled={isSaving || !course}>
            Reject
          </Button>
          <Button variant="outline" onClick={() => void save("suspended")} disabled={isSaving || !course}>
            Suspend
          </Button>
          <Button variant="secondary" onClick={() => void save()} disabled={isSaving || !course}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={() => void save("approved")} disabled={isSaving || !course || !approvalReady}>
            Save and Approve
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Loading course details...</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {course ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusBadge kind="course" value={course.status} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Enrollments</p>
              <p className="mt-2 text-sm font-medium text-foreground">{course._count.enrollments}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sections</p>
              <p className="mt-2 text-sm font-medium text-foreground">{course._count.sections}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {Number.isFinite(parsedDraftPrice) && parsedDraftPrice >= 0
                  ? formatUsd(parsedDraftPrice)
                  : formatUsd(course.price)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_380px]">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Course Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Review and refine the learner-facing information before publishing.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-course-title">Title</Label>
                    <Input id="admin-course-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-course-description">Description</Label>
                    <Textarea
                      id="admin-course-description"
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
                  <Label htmlFor="admin-course-moderation-note">Moderation note</Label>
                  <Textarea
                    id="admin-course-moderation-note"
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    className="min-h-40"
                    placeholder="Add internal review notes or a rejection reason for this course."
                  />
                  <p className="text-xs text-muted-foreground">
                    This note is only for admins and does not appear on the public course page.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      {course.status === "approved" ? (
                        <Eye className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-amber-600" />
                      )}
                      <p className="text-sm font-semibold text-foreground">Public Visibility</p>
                    </div>
                    <div className="mt-3">
                      <Badge variant={course.status === "approved" ? "default" : "outline"}>
                        {course.status === "approved" ? "Visible to learners" : "Hidden from public learners"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {course.status === "approved"
                        ? "This course can appear on the public platform."
                        : "Only admins and the instructor can preview this course."}
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
                        {learnerAccessible ? "Course is learner-ready" : "Learner access is blocked"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {learnerAccessible
                        ? "Learners can purchase and access this course."
                        : "Learner access requires approval plus at least one section and lesson."}
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
                        ? "Core metadata and lesson structure are complete."
                        : "Review the checklist below before approving this course."}
                    </p>
                  </div>
                </div>

                {approvalReady ? (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Ready for approval</AlertTitle>
                    <AlertDescription>
                      This course has the core structure and metadata needed for approval.
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
                    <h2 className="text-lg font-semibold text-foreground">Course Outline</h2>
                    <p className="text-sm text-muted-foreground">Inspect sections and lessons before approving.</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{totalLessons} lessons</p>
                </div>
                <div className="mt-4 space-y-3">
                  {course.sections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">This course does not have sections yet.</p>
                  ) : (
                    course.sections.map((section) => (
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
                    Adjust pricing, category, and feature placement before moderation.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-course-price">Price (USD)</Label>
                    <Input
                      id="admin-course-price"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-11 text-base font-medium"
                    />
                    <p className="text-xs text-muted-foreground">Set the learner-facing price in whole USD units.</p>
                    <p className="text-sm font-medium text-foreground">
                      Live preview:{" "}
                      {Number.isFinite(parsedDraftPrice) && parsedDraftPrice >= 0
                        ? formatUsd(parsedDraftPrice)
                        : "Enter a valid price"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-course-category">Category</Label>
                    <select
                      id="admin-course-category"
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

                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                    Feature this course on the platform
                  </label>
                </div>

                <Separator className="my-5" />

                <div className="flex flex-col gap-2">
                  <Button variant="secondary" onClick={() => void save()} disabled={isSaving || !course}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button onClick={() => void save("approved")} disabled={isSaving || !course || !approvalReady}>
                    Save and Approve
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => void save("rejected")} disabled={isSaving || !course}>
                      Reject
                    </Button>
                    <Button variant="outline" onClick={() => void save("suspended")} disabled={isSaving || !course}>
                      Suspend
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Instructor</p>
                <p className="mt-2 text-sm text-foreground">{course.instructor.name}</p>
                <p className="text-xs text-muted-foreground">{course.instructor.email}</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Pending Queue</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {currentPendingIndex >= 0 ? (
                    <p>
                      Reviewing pending submission {currentPendingIndex + 1} of {pendingQueue.length}.
                    </p>
                  ) : (
                    <p>This course is not currently in the pending queue.</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previousPendingCourse && router.push(`/admin/courses/${previousPendingCourse.id}`)}
                      disabled={!previousPendingCourse || isSaving}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => nextPendingCourse && router.push(`/admin/courses/${nextPendingCourse.id}`)}
                      disabled={!nextPendingCourse || isSaving}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Review Notes</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>Created: {new Date(course.createdAt).toLocaleString("en-ZW")}</p>
                  <p>Updated: {new Date(course.updatedAt).toLocaleString("en-ZW")}</p>
                  <p>Favorites: {course._count.favorites}</p>
                  <p>Reports: {course._count.reports}</p>
                </div>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href={publicLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Course Preview
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
