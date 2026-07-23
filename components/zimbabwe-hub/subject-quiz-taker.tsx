"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

type Question = {
  id: string
  type: "multiple_choice" | "short_answer"
  prompt: string
  order: number
  options: string[] | null
}

type ExistingAnswer = {
  questionId: string
  selectedOption: number | null
  textAnswer: string | null
  isCorrect: boolean | null
  reviewerFeedback: string | null
}

type QuizData = {
  quiz: { id: string; title: string; questions: Question[] }
  attempt: {
    id: string
    score: number | null
    submittedAt: string | null
    gradedAt: string | null
    answers: ExistingAnswer[]
  } | null
}

export function SubjectQuizTaker({ quizId, open, onOpenChange }: { quizId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [data, setData] = useState<QuizData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selections, setSelections] = useState<Record<string, number>>({})
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; pendingReview: boolean } | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      setResult(null)
      const res = await fetch(`/api/subject-quiz/${quizId}`, { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (cancelled) return
      if (!res || !res.ok) {
        setError(json?.error ?? "Failed to load quiz")
        setIsLoading(false)
        return
      }
      setData(json as QuizData)
      const initialSelections: Record<string, number> = {}
      const initialText: Record<string, string> = {}
      for (const a of json.attempt?.answers ?? []) {
        if (a.selectedOption !== null) initialSelections[a.questionId] = a.selectedOption
        if (a.textAnswer !== null) initialText[a.questionId] = a.textAnswer
      }
      setSelections(initialSelections)
      setTextAnswers(initialText)
      setIsLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [quizId, open])

  const submit = async () => {
    if (!data) return
    setSubmitting(true)
    try {
      const answers = data.quiz.questions.map((q) => ({
        questionId: q.id,
        ...(q.type === "multiple_choice"
          ? { selectedOption: selections[q.id] }
          : { textAnswer: textAnswers[q.id] ?? "" }),
      }))
      const res = await fetch(`/api/subject-quiz/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to submit quiz")

      setResult({ score: json.attempt.score ?? 0, pendingReview: json.pendingReview })
      toast({ title: "Quiz submitted" })
    } catch (e) {
      toast({ title: "Failed to submit quiz", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setSubmitting(false)
    }
  }

  const totalMultipleChoice = data?.quiz.questions.filter((q) => q.type === "multiple_choice").length ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{data?.quiz.title ?? "Quiz"}</DialogTitle>
        </DialogHeader>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading quiz...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {result ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-medium text-foreground">
              You scored {result.score} out of {totalMultipleChoice} multiple-choice question{totalMultipleChoice === 1 ? "" : "s"} correct.
            </p>
            {result.pendingReview ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Your short-answer response is awaiting your tutor&apos;s review.
              </p>
            ) : null}
          </div>
        ) : data ? (
          <div className="space-y-4">
            {data.quiz.questions.map((q, index) => (
              <div key={q.id} className="rounded-lg border border-border p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {index + 1}. {q.prompt}
                </p>
                {q.type === "multiple_choice" ? (
                  <div className="space-y-1">
                    {(q.options ?? []).map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`quiz-${q.id}`}
                          checked={selections[q.id] === optionIndex}
                          onChange={() => setSelections((prev) => ({ ...prev, [q.id]: optionIndex }))}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    value={textAnswers[q.id] ?? ""}
                    onChange={(e) => setTextAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type your answer..."
                  />
                )}
              </div>
            ))}

            {data.attempt?.gradedAt ? (
              <Badge variant="secondary">Previous score: {data.attempt.score ?? 0}</Badge>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {data && !result ? (
            <Button onClick={() => void submit()} disabled={submitting}>
              Submit Quiz
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
