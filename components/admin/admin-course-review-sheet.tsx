"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ExternalLink, Eye, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StatusBadge } from "@/components/admin/status-badge"
import { toast } from "@/hooks/use-toast"

type Category = { id: string; name: string }

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

export function AdminCourseReviewSheet({
  courseId,
  open,
  categories,
  onOpenChange,
  onSaved,
}: {
  courseId: string | null
  open: boolean
  categories: Category[]
  onOpenChange: (open: boolean) => void
  onSaved: () => Promise<void> | void
}) {
  const [course, setCourse] = useState<ReviewCourse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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

  useEffect(() => {
    if (!open || !courseId) return

    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/courses/${courseId}`, { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (cancelled) return

      if (!res || !res.ok) {
        setCourse(null)
        setError(json?.error ?? "Failed to load course details")
        setIsLoading(false)
        return
      }

      const nextCourse = json?.course as ReviewCourse
      setCourse(nextCourse)
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
  }, [courseId, open])

  const save = async (nextStatus?: ReviewCourse["status"]) => {
    if (!courseId) return
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
      toast({ title: nextStatus ? "Course reviewed" : "Course details saved" })
      await onSaved()
      if (nextStatus) onOpenChange(false)
    } catch (e) {
      toast({ title: "Failed to save course", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[min(1320px,96vw)] max-w-none flex-col overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Review Course</DialogTitle>
          <DialogDescription>
            Check the course content, correct details like price, and then moderate it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading course details...</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {course ? (
            <div className="space-y-6">
            <div className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <div className="mt-2">
                  <StatusBadge kind="course" value={course.status} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Enrollments</p>
                <p className="mt-2 text-sm font-medium text-foreground">{course._count.enrollments}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sections</p>
                <p className="mt-2 text-sm font-medium text-foreground">{course._count.sections}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {Number.isFinite(parsedDraftPrice) && parsedDraftPrice >= 0
                    ? formatUsd(parsedDraftPrice)
                    : formatUsd(course.price)}
                </p>
              </div>
            </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
                <div className="space-y-6">
                  <div className="rounded-xl border border-border p-5">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-foreground">Course Details</p>
                      <p className="text-sm text-muted-foreground">
                        Review and refine the course information before it becomes visible to learners.
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
                          className="min-h-40"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-5">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-foreground">Internal Moderation Notes</p>
                      <p className="text-sm text-muted-foreground">
                        Record internal review comments, correction requests, or rejection reasons.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-course-moderation-note">Moderation note</Label>
                      <Textarea
                        id="admin-course-moderation-note"
                        value={moderationNote}
                        onChange={(e) => setModerationNote(e.target.value)}
                        className="min-h-36"
                        placeholder="Add internal review notes or a rejection reason for this course."
                      />
                      <p className="text-xs text-muted-foreground">
                        This note is for admin workflow only and is not shown on the public course page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 self-start xl:sticky xl:top-0">
                  <div className="rounded-xl border border-border p-5">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-foreground">Publishing Controls</p>
                      <p className="text-sm text-muted-foreground">
                        Adjust price and course visibility settings before moderation.
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
                        <p className="text-xs text-muted-foreground">
                          Set the learner-facing price in whole USD units.
                        </p>
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
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <p className="text-sm font-semibold text-foreground">Instructor</p>
                    <p className="mt-2 text-sm text-foreground">{course.instructor.name}</p>
                    <p className="text-xs text-muted-foreground">{course.instructor.email}</p>
                  </div>

                  <div className="rounded-xl border border-border p-4">
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

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-border p-4">
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
                        : "Only admins and the instructor can access this course preview right now."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
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

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
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

                <div className="rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Course Outline</p>
                      <p className="text-sm text-muted-foreground">Review the structure before approving.</p>
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
          ) : null}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void save("rejected")} disabled={isSaving || !course}>
                Reject
              </Button>
              <Button variant="outline" onClick={() => void save("suspended")} disabled={isSaving || !course}>
                Suspend
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void save()} disabled={isSaving || !course}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={() => void save("approved")} disabled={isSaving || !course || !approvalReady}>
                Save and Approve
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
