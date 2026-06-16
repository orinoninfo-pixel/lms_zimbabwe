"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, CalendarDays, GraduationCap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type SubjectPackageRow = {
  id: string
  title: string
  description: string
  subject: string
  grade: number
  term: number | null
  price: number
  currency: "ZAR"
  billingPeriod: "monthly"
  isCapsAligned: boolean
  includesLiveLessons: boolean
  isExamPrep: boolean
  isHolidayLearning: boolean
  teacherName: string | null
  lessonsCount: number
  enrollment: { status: string; endDate: string | null; price: number; billingPeriod: string } | null
}

const formatMonthly = (amount: number) => `R${amount}/month`

const packageColors = [
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-amber-100 text-amber-700",
] as const

export function SaLearningHub() {
  const [rows, setRows] = useState<SubjectPackageRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [subject, setSubject] = useState<string>("")
  const [grade, setGrade] = useState<string>("")
  const [term, setTerm] = useState<string>("")
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
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (includesLiveLessons) params.set("includesLiveLessons", "true")
    if (isExamPrep) params.set("isExamPrep", "true")
    if (isHolidayLearning) params.set("isHolidayLearning", "true")
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [subject, grade, term, minPrice, maxPrice, includesLiveLessons, isExamPrep, isHolidayLearning])

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
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">CAPS-Aligned Subjects</p>
              <p className="text-sm text-muted-foreground">Structured support per grade and term</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Live Lesson Access</p>
              <p className="text-sm text-muted-foreground">Join scheduled sessions for subscribed subjects</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Exam Preparation</p>
              <p className="text-sm text-muted-foreground">Past papers, revision, and holiday catch-up</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Flexible Monthly Access</p>
              <p className="text-sm text-muted-foreground">Subscribe only to the subjects you need</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Browse subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Mathematics)"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            />
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Any grade</option>
              {[8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={String(g)}>
                  Grade {g}
                </option>
              ))}
            </select>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Any term</option>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
              <option value="4">Term 4</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min price"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max price"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={includesLiveLessons}
                onChange={(e) => setIncludesLiveLessons(e.target.checked)}
              />
              Live lessons included
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={isExamPrep} onChange={(e) => setIsExamPrep(e.target.checked)} />
              Exam prep
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isHolidayLearning}
                onChange={(e) => setIsHolidayLearning(e.target.checked)}
              />
              Holiday learning
            </label>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Loading subjects...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6">
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
            const title = p.title || `${p.subject} · Grade ${p.grade}`
            const color = packageColors[index % packageColors.length]
            return (
              <Card key={p.id} className="overflow-hidden">
                <CardHeader className="space-y-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
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
                    {p.isCapsAligned ? <Badge variant="secondary">CAPS-aligned</Badge> : null}
                    {p.includesLiveLessons ? <Badge>Live lessons</Badge> : null}
                    {p.isExamPrep ? <Badge variant="outline">Exam prep</Badge> : null}
                    {p.isHolidayLearning ? <Badge variant="outline">Holiday learning</Badge> : null}
                    {active ? <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Active</Badge> : null}
                    {p.enrollment?.status === "pending" ? (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-500">Pending</Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Grade</p>
                      <p className="font-medium text-foreground">Grade {p.grade}</p>
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
                      <Link href={`/sa-learning-hub/${p.id}`}>{active ? "View Details" : "View Details"}</Link>
                    </Button>
                    {!active ? (
                      <Button asChild variant="outline">
                        <Link href={`/sa-learning-hub/${p.id}`}>Subscribe</Link>
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
