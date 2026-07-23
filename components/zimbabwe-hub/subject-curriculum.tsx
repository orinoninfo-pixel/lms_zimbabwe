"use client"

import { useEffect, useState } from "react"
import { ChevronDown, PlayCircle, Lock, CheckCircle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SubjectQuizTaker } from "@/components/zimbabwe-hub/subject-quiz-taker"

type Lesson = { id: string; title: string; quiz?: { id: string } | null }
type Section = { id: string; title: string; lessons: Lesson[] }

export function SubjectCurriculum({
  subjectPackageId,
  sections,
  hasActiveAccess,
}: {
  subjectPackageId: string
  sections: Section[]
  hasActiveAccess: boolean
}) {
  const [expandedSections, setExpandedSections] = useState<string[]>([sections[0]?.id ?? ""])
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  const [busyLessonId, setBusyLessonId] = useState<string | null>(null)
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)

  useEffect(() => {
    if (!hasActiveAccess) return
    let cancelled = false
    const load = async () => {
      const res = await fetch(`/api/subject-progress/${subjectPackageId}`, { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!cancelled && res?.ok) {
        setCompletedLessonIds((json?.completedLessonIds ?? []) as string[])
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [subjectPackageId, hasActiveAccess])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    )
  }

  const toggleLessonComplete = async (lessonId: string) => {
    if (!hasActiveAccess) return
    const nextCompleted = !completedLessonIds.includes(lessonId)
    setBusyLessonId(lessonId)
    try {
      const res = await fetch("/api/subject-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: nextCompleted }),
      }).catch(() => null)
      if (res?.ok) {
        setCompletedLessonIds((prev) =>
          nextCompleted ? [...prev, lessonId] : prev.filter((id) => id !== lessonId)
        )
      }
    } finally {
      setBusyLessonId(null)
    }
  }

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0)
  if (sections.length === 0) return null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Curriculum</h3>
        <p className="text-sm text-muted-foreground">
          {sections.length} section{sections.length !== 1 ? "s" : ""} &middot; {totalLessons} lesson
          {totalLessons !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.includes(section.id)
          return (
            <div key={section.id} className={cn(index > 0 && "border-t border-border")}>
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={cn("h-5 w-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
                  />
                  <div>
                    <p className="font-semibold text-foreground">{section.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded ? (
                <ul className="divide-y divide-border">
                  {section.lessons.map((lesson) => {
                    const isCompleted = completedLessonIds.includes(lesson.id)
                    return (
                      <li key={lesson.id} className="flex items-center justify-between gap-2 p-4 hover:bg-muted/30 transition-colors">
                        <button
                          onClick={() => void toggleLessonComplete(lesson.id)}
                          disabled={!hasActiveAccess || busyLessonId === lesson.id}
                          className="flex flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
                        >
                          <span className="text-muted-foreground">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-accent" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                          </span>
                          <span className={cn("text-sm", isCompleted ? "text-muted-foreground" : "text-foreground")}>
                            {lesson.title}
                          </span>
                        </button>
                        {lesson.quiz ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!hasActiveAccess}
                            onClick={() => setActiveQuizId(lesson.quiz!.id)}
                            className="gap-1"
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                            Quiz
                          </Button>
                        ) : null}
                        {!hasActiveAccess ? <Lock className="h-4 w-4 text-muted-foreground/50" /> : null}
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          )
        })}
      </div>

      {activeQuizId ? (
        <SubjectQuizTaker
          quizId={activeQuizId}
          open={Boolean(activeQuizId)}
          onOpenChange={(open) => {
            if (!open) setActiveQuizId(null)
          }}
        />
      ) : null}
    </div>
  )
}
