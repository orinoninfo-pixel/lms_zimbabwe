"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, CalendarDays, GraduationCap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ZIM_LEVELS, EXAMINING_BODIES, formatZimLevel, formatExaminingBody } from "@/lib/zim-education"

type SubjectPackageRow = {
  id: string
  title: string
  description: string
  subject: string
  grade: number
  term: number | null
  price: number
  currency: "USD" | "ZWL" | "ZAR"
  billingPeriod: "monthly"
  isCapsAligned: boolean
  examiningBody: string
  includesLiveLessons: boolean
  isExamPrep: boolean
  isHolidayLearning: boolean
  teacherName: string | null
  lessonsCount: number
  enrollment: { status: string; endDate: string | null; price: number; billingPeriod: string } | null
}

const formatMonthly = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount) + "/month"

const packageColors = [
  "bg-primary/12 text-primary",
  "bg-accent/22 text-accent-foreground",
  "bg-success/20 text-success",
  "bg-secondary/20 text-secondary-foreground",
  "bg-info/20 text-info",
  "bg-warning/20 text-warning-foreground",
] as const

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"

export function ZimbabweLearningHub() {
  const [rows, setRows] = useState<SubjectPackageRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [subject, setSubject] = useState<string>("")
  const [grade, setGrade] = useState<string>("")
  const [term, setTerm] = useState<string>("")
  const [examiningBody, setExaminingBody] = useState<string>("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [includesLiveLessons, setIncludesLiveLessons] = useState(false)
  const [isExamPrep, setIsExamPrep] = useState(false)
  const [isHolidayLearning, setIsHolidayLearning] = useState(false)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (subject.trim()) params.set("subject", subject.trim())
    if (grade) params.set("grade", grade)
    if (term) params.set("term", term)
    if (examiningBody) params.set("examiningBody", examiningBody)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (includesLiveLessons) params.set("includesLiveLessons", "true")
    if (isExamPrep) params.set("isExamPrep", "true")
    if (isHolidayLearning) params.set("isHolidayLearning", "true")
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [subject, grade, term, examiningBody, minPrice, maxPrice, includesLiveLessons, isExamPrep, isHolidayLearning])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/sa-hub/packages${query}`, { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (cancelled) return
      if (!res || !res.ok) {
        setRows([])
        setError(json?.error ?? "Failed to load subject packages")
        setIsLoading(false)
        return
      }
      setRows((json?.packages ?? []) as SubjectPackageRow[])
      setIsLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/12 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">ZIMSEC & Cambridge Subjects</p>
              <p className="text-sm text-muted-foreground">Structured support per grade/form and term</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary/20 text-secondary-foreground">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Live Lesson Access</p>
              <p className="text-sm text-muted-foreground">Join scheduled sessions for subscribed subjects</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-success/20 text-success">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Exam Preparation</p>
              <p className="text-sm text-muted-foreground">Past papers, revision, and holiday catch-up</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-warning/20 text-warning-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Flexible Monthly Access</p>
              <p className="text-sm text-muted-foreground">Subscribe only to the subjects you need</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">Browse subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Mathematics)"
            />
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={selectClassName}
              aria-label="Filter by grade"
            >
              <option value="">Any grade / form</option>
              {ZIM_LEVELS.map((level) => (
                <option key={level.value} value={String(level.value)}>
                  {level.label}
                </option>
              ))}
            </select>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className={selectClassName}
              aria-label="Filter by term"
            >
              <option value="">Any term</option>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
              <option value="4">Term 4</option>
            </select>
            <select
              value={examiningBody}
              onChange={(e) => setExaminingBody(e.target.value)}
              className={selectClassName}
              aria-label="Filter by examining body"
            >
              <option value="">Any examining body</option>
              {EXAMINING_BODIES.map((body) => (
                <option key={body.value} value={body.value}>
                  {body.label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min price"
                aria-label="Minimum price"
              />
              <Input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max price"
                aria-label="Maximum price"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={includesLiveLessons}
                onChange={(e) => setIncludesLiveLessons(e.target.checked)}
                className="h-4 w-4 rounded-sm border-border text-primary focus:ring-ring/40"
              />
              Live lessons included
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isExamPrep}
                onChange={(e) => setIsExamPrep(e.target.checked)}
                className="h-4 w-4 rounded-sm border-border text-primary focus:ring-ring/40"
              />
              Exam prep
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isHolidayLearning}
                onChange={(e) => setIsHolidayLearning(e.target.checked)}
                className="h-4 w-4 rounded-sm border-border text-primary focus:ring-ring/40"
              />
              Holiday learning
            </label>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <p className="text-sm text-muted-foreground">Loading subjects...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-card p-6 shadow-xs">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No subjects found</EmptyTitle>
              <EmptyDescription>Try adjusting your filters.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p, index) => {
            const active = p.enrollment?.status === "active"
            const title = p.title || `${p.subject} · ${formatZimLevel(p.grade)}`
            const color = packageColors[index % packageColors.length]
            return (
              <Card key={p.id} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
                <CardHeader className="space-y-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-md ${color}`}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatMonthly(p.price)}</p>
                      <p className="text-xs text-muted-foreground">subject subscription</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">{formatExaminingBody(p.examiningBody)}</Badge>
                    {p.includesLiveLessons ? <Badge variant="secondary">Live lessons</Badge> : null}
                    {p.isExamPrep ? <Badge variant="outline">Exam prep</Badge> : null}
                    {p.isHolidayLearning ? <Badge variant="outline">Holiday learning</Badge> : null}
                    {active ? <Badge variant="success">Active</Badge> : null}
                    {p.enrollment?.status === "pending" ? (
                      <Badge variant="warning">Pending</Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Grade / Form</p>
                      <p className="font-medium text-foreground">{formatZimLevel(p.grade)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lessons</p>
                      <p className="font-medium text-foreground">{p.lessonsCount}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Teacher</p>
                      <p className="font-medium text-foreground">{p.teacherName ?? "To be announced"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/zimbabwe-learning-hub/${p.id}`}>View Details</Link>
                    </Button>
                    {!active ? (
                      <Button asChild variant="outline">
                        <Link href={`/zimbabwe-learning-hub/${p.id}`}>Subscribe</Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
