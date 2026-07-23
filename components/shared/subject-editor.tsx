"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ZIM_LEVELS, EXAMINING_BODIES } from "@/lib/zim-education"
import { CurriculumBuilder, type Section as BuilderSection } from "@/components/instructor/course-creator/curriculum-builder"
import { SubjectQuizManager } from "@/components/shared/subject-quiz-manager"

type Category = { id: string; name: string }

const isPersistedLessonId = (id: string) => !id.startsWith("lesson-")

const terms = [1, 2, 3, 4]

export function SubjectEditor({
  apiBasePath,
  backHref,
  subjectId,
}: {
  apiBasePath: string
  backHref: string
  subjectId?: string
}) {
  const router = useRouter()
  const isEdit = Boolean(subjectId)

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [grade, setGrade] = useState<string>("")
  const [term, setTerm] = useState<string>("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [isCapsAligned, setIsCapsAligned] = useState(true)
  const [examiningBody, setExaminingBody] = useState<string>("zimsec")
  const [includesLiveLessons, setIncludesLiveLessons] = useState(true)
  const [isExamPrep, setIsExamPrep] = useState(false)
  const [isHolidayLearning, setIsHolidayLearning] = useState(false)
  const [sections, setSections] = useState<BuilderSection[]>([])
  const [enrollmentsCount, setEnrollmentsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const curriculumLocked = isEdit && enrollmentsCount > 0
  const persistedLessons = sections
    .flatMap((section) => section.lessons)
    .filter((lesson) => isPersistedLessonId(lesson.id))

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const categoriesRes = await fetch("/api/categories", { cache: "no-store" }).catch(() => null)
      const categoriesJson = categoriesRes ? await categoriesRes.json().catch(() => null) : null
      if (!cancelled) setCategories((categoriesJson?.categories ?? []) as Category[])

      if (!subjectId) return

      const res = await fetch(`${apiBasePath}/${subjectId}`, { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (cancelled) return
      const s = json?.subject
      if (!res || !res.ok || !s) {
        setNotFound(true)
        setIsLoading(false)
        return
      }
      setTitle(s.title)
      setDescription(s.description)
      setSubject(s.subject)
      setGrade(String(s.grade))
      setTerm(s.term ? String(s.term) : "")
      setPrice(String(s.price))
      setCategoryId(s.categoryId ?? "")
      setIsCapsAligned(s.isCapsAligned)
      setExaminingBody(s.examiningBody ?? "zimsec")
      setIncludesLiveLessons(s.includesLiveLessons)
      setIsExamPrep(s.isExamPrep)
      setIsHolidayLearning(s.isHolidayLearning)
      setEnrollmentsCount(s._count?.enrollments ?? 0)
      setSections(
        ((s.sections ?? []) as Array<{
          id: string
          title: string
          lessons: Array<{ id: string; title: string }>
        }>).map((section) => ({
          id: section.id,
          title: section.title,
          isExpanded: false,
          lessons: section.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type: "video" as const,
            duration: "",
            isPreview: false,
          })),
        }))
      )
      setIsLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
    // apiBasePath is static per page; only subjectId should retrigger the load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  const isValid =
    title.trim().length > 0 &&
    description.trim().length >= 20 &&
    subject.trim().length > 0 &&
    grade.trim().length > 0 &&
    price.trim().length > 0

  const save = async () => {
    setError(null)
    if (!isValid) {
      setError("Add a title, subject name, grade, a description of at least 20 characters, and a price.")
      return
    }
    setIsSaving(true)
    try {
      const priceValue = Number(price)
      const gradeValue = Number(grade)
      const termValue = term.trim() ? Number(term) : null

      const payload = {
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        grade: Number.isFinite(gradeValue) ? Math.round(gradeValue) : 0,
        term: termValue,
        price: Number.isFinite(priceValue) ? Math.round(priceValue) : 0,
        categoryId: categoryId || null,
        isCapsAligned,
        examiningBody,
        includesLiveLessons,
        isExamPrep,
        isHolidayLearning,
        ...(curriculumLocked
          ? {}
          : {
              sections: sections.map((section) => ({
                title: section.title,
                lessons: section.lessons.map((lesson) => ({ title: lesson.title })),
              })),
            }),
      }

      const res = await fetch(isEdit ? `${apiBasePath}/${subjectId}` : apiBasePath, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? "Failed to save subject")
        return
      }
      router.push(backHref)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading subject...</p>
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Subject not found.</p>
        <Button asChild variant="outline">
          <Link href={backHref}>Back to My Subjects</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={backHref} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Back to My Subjects</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{isEdit ? "Edit Subject" : "New Subject"}</h1>
        <p className="text-muted-foreground">
          Subjects power the Zimbabwe Learning Hub — ZIMSEC/Cambridge-aligned support by grade and term, with
          live lessons, homework, and exam resources.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Subject Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Package Title</Label>
            <Input
              id="title"
              placeholder="e.g., Grade 12 Mathematics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe what this subject package covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Grade / Form</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade or form" />
                </SelectTrigger>
                <SelectContent>
                  {ZIM_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={String(level.value)}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Term (optional)</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Any term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      Term {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Examining Body</Label>
              <Select value={examiningBody} onValueChange={setExaminingBody}>
                <SelectTrigger>
                  <SelectValue placeholder="Select examining body" />
                </SelectTrigger>
                <SelectContent>
                  {EXAMINING_BODIES.map((body) => (
                    <SelectItem key={body.value} value={body.value}>
                      {body.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="price">Price (USD / month)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                placeholder="199"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Curriculum aligned</p>
                <p className="text-xs text-muted-foreground">This package follows the official school curriculum.</p>
              </div>
              <Switch checked={isCapsAligned} onCheckedChange={setIsCapsAligned} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Includes live lessons</p>
                <p className="text-xs text-muted-foreground">Enrolled students get scheduled live sessions.</p>
              </div>
              <Switch checked={includesLiveLessons} onCheckedChange={setIncludesLiveLessons} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Exam preparation</p>
                <p className="text-xs text-muted-foreground">Focused on past papers and exam technique.</p>
              </div>
              <Switch checked={isExamPrep} onCheckedChange={setIsExamPrep} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Holiday learning</p>
                <p className="text-xs text-muted-foreground">Suitable for holiday catch-up programs.</p>
              </div>
              <Switch checked={isHolidayLearning} onCheckedChange={setIsHolidayLearning} />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => void save()} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isEdit ? "Save Changes" : "Create Subject"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Subjects go live immediately for students to browse and enroll in the Zimbabwe Learning Hub — there is
            no separate admin approval step for subjects today.
          </p>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Curriculum (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {curriculumLocked ? (
            <Alert>
              <AlertTitle>Curriculum locked</AlertTitle>
              <AlertDescription>
                This subject already has enrolled students, so its curriculum can no longer be changed.
              </AlertDescription>
            </Alert>
          ) : (
            <CurriculumBuilder sections={sections} onChange={setSections} />
          )}
        </CardContent>
      </Card>

      {isEdit ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Lesson Quizzes (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {persistedLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Save this subject with at least one lesson, then reload this page to add quizzes.
              </p>
            ) : (
              persistedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                  <SubjectQuizManager
                    lessonId={lesson.id}
                    lessonTitle={lesson.title}
                    quizApiBasePath={apiBasePath.replace("/subjects", "/lessons")}
                    quizAttemptsApiBasePath={apiBasePath.replace("/subjects", "/quiz-attempts")}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
