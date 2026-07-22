"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StatusBadge } from "@/components/admin/status-badge"

type Category = { id: string; name: string }
type CourseStatus = "draft" | "pending" | "approved" | "rejected" | "suspended"

export function InstructorCourseEdit({ courseId }: { courseId: string }) {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState<CourseStatus | null>(null)
  const [moderationNote, setModerationNote] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [courseRes, categoriesRes] = await Promise.all([
        fetch(`/api/instructor/courses/${courseId}`, { cache: "no-store" }).catch(() => null),
        fetch("/api/categories", { cache: "no-store" }).catch(() => null),
      ])
      if (cancelled) return

      const categoriesJson = categoriesRes ? await categoriesRes.json().catch(() => null) : null
      setCategories((categoriesJson?.categories ?? []) as Category[])

      if (!courseRes || !courseRes.ok) {
        setNotFound(true)
        setIsLoading(false)
        return
      }
      const courseJson = await courseRes.json().catch(() => null)
      const course = courseJson?.course
      if (!course) {
        setNotFound(true)
        setIsLoading(false)
        return
      }
      setTitle(course.title)
      setDescription(course.description)
      setPrice(String(course.price))
      setCategoryId(course.categoryId ?? "")
      setStatus(course.status)
      setModerationNote(course.moderationNote ?? null)
      setIsLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [courseId])

  const isValid = title.trim().length > 0 && description.trim().length >= 20 && price.trim().length > 0
  const canSubmit = status === "draft" || status === "rejected"

  const save = async (submitForApproval: boolean) => {
    setError(null)
    if (!isValid) {
      setError("Add a title, a description of at least 20 characters, and a price.")
      return
    }
    setIsSaving(true)
    try {
      const priceValue = Number(price)
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: Number.isFinite(priceValue) ? Math.round(priceValue) : 0,
          categoryId: categoryId || null,
          ...(submitForApproval ? { action: "submit" } : {}),
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? "Failed to save course")
        return
      }
      router.push("/instructor/courses")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading course...</p>
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Course not found.</p>
        <Button asChild variant="outline">
          <Link href="/instructor/courses">Back to My Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/instructor/courses"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Back to My Courses</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
        {status ? <StatusBadge kind="course" value={status} /> : null}
      </div>

      {status === "rejected" && moderationNote ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-950 [&>svg]:text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Changes requested by the review team</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{moderationNote}</AlertDescription>
        </Alert>
      ) : null}

      {status === "pending" ? (
        <Alert>
          <AlertTitle>Waiting on review</AlertTitle>
          <AlertDescription>
            This course is in the admin review queue. You can still update it, but changes are only visible to you
            until it&apos;s approved.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" onClick={() => void save(false)} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            {canSubmit ? (
              <Button onClick={() => void save(true)} disabled={isSaving} className="gap-2">
                <Send className="h-4 w-4" />
                {status === "rejected" ? "Resubmit for Review" : "Submit for Review"}
              </Button>
            ) : null}
          </div>
          {!canSubmit && status ? (
            <p className="text-xs text-muted-foreground">
              This course is {status}. Only draft or rejected courses can be resubmitted for approval.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
