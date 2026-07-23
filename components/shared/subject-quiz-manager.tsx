"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, HelpCircle, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { toast } from "@/hooks/use-toast"

type QuestionDraft = {
  key: string
  type: "multiple_choice" | "short_answer"
  prompt: string
  options: string[]
  correctOption: number
}

type QuizQuestionApi = {
  id: string
  type: "multiple_choice" | "short_answer"
  prompt: string
  options: string[] | null
  correctOption: number | null
}

type AttemptAnswer = {
  id: string
  selectedOption: number | null
  textAnswer: string | null
  isCorrect: boolean | null
  reviewerFeedback: string | null
  question: QuizQuestionApi
}

type Attempt = {
  id: string
  score: number | null
  submittedAt: string | null
  gradedAt: string | null
  student: { id: string; name: string; email: string }
  answers: AttemptAnswer[]
}

let keySeq = 0
const nextKey = () => `q-${Date.now()}-${keySeq++}`

function emptyQuestion(): QuestionDraft {
  return { key: nextKey(), type: "multiple_choice", prompt: "", options: ["", ""], correctOption: 0 }
}

export function SubjectQuizManager({
  lessonId,
  lessonTitle,
  quizApiBasePath,
  quizAttemptsApiBasePath,
}: {
  lessonId: string
  lessonTitle: string
  quizApiBasePath: string
  quizAttemptsApiBasePath: string
}) {
  const [hasQuiz, setHasQuiz] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [checking, setChecking] = useState(true)

  const [editorOpen, setEditorOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState<QuestionDraft[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [attemptsOpen, setAttemptsOpen] = useState(false)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [attemptsLoading, setAttemptsLoading] = useState(false)
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})
  const [correctDrafts, setCorrectDrafts] = useState<Record<string, boolean>>({})
  const [gradingAttemptId, setGradingAttemptId] = useState<string | null>(null)

  const check = async () => {
    setChecking(true)
    const res = await fetch(`${quizApiBasePath}/${lessonId}/quiz`, { cache: "no-store" }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    setHasQuiz(Boolean(json?.quiz))
    setAttemptCount(json?.quiz?._count?.attempts ?? 0)
    setChecking(false)
  }

  useEffect(() => {
    void check()
    // lessonId is stable per row
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  const openEditor = async () => {
    setFormError(null)
    const res = await fetch(`${quizApiBasePath}/${lessonId}/quiz`, { cache: "no-store" }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    const quiz = json?.quiz as { title: string; questions: QuizQuestionApi[] } | null

    if (quiz) {
      setTitle(quiz.title)
      setQuestions(
        quiz.questions.map((q) => ({
          key: nextKey(),
          type: q.type,
          prompt: q.prompt,
          options: q.options ?? ["", ""],
          correctOption: q.correctOption ?? 0,
        }))
      )
    } else {
      setTitle(`${lessonTitle} Quiz`)
      setQuestions([emptyQuestion()])
    }
    setEditorOpen(true)
  }

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()])
  const removeQuestion = (key: string) => setQuestions((prev) => prev.filter((q) => q.key !== key))
  const updateQuestion = (key: string, updates: Partial<QuestionDraft>) =>
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...updates } : q)))

  const save = async () => {
    setFormError(null)
    if (!title.trim()) {
      setFormError("Add a quiz title.")
      return
    }
    if (questions.length === 0) {
      setFormError("Add at least one question.")
      return
    }
    for (const q of questions) {
      if (!q.prompt.trim()) {
        setFormError("Every question needs a prompt.")
        return
      }
      if (q.type === "multiple_choice") {
        const cleanOptions = q.options.map((o) => o.trim()).filter(Boolean)
        if (cleanOptions.length < 2) {
          setFormError("Multiple-choice questions need at least 2 options.")
          return
        }
      }
    }

    setSaving(true)
    try {
      const res = await fetch(`${quizApiBasePath}/${lessonId}/quiz`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          questions: questions.map((q) =>
            q.type === "multiple_choice"
              ? {
                  type: "multiple_choice",
                  prompt: q.prompt.trim(),
                  options: q.options.map((o) => o.trim()).filter(Boolean),
                  correctOption: q.correctOption,
                }
              : { type: "short_answer", prompt: q.prompt.trim() }
          ),
        }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to save quiz")

      toast({ title: "Quiz saved" })
      setEditorOpen(false)
      await check()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setSaving(false)
    }
  }

  const deleteQuiz = async () => {
    const res = await fetch(`${quizApiBasePath}/${lessonId}/quiz`, { method: "DELETE" }).catch(() => null)
    if (!res || !res.ok) {
      toast({ title: "Failed to delete quiz" })
      return
    }
    toast({ title: "Quiz deleted" })
    await check()
  }

  const openAttempts = async () => {
    setAttemptsOpen(true)
    setAttemptsLoading(true)
    const res = await fetch(`${quizApiBasePath}/${lessonId}/quiz/attempts`, { cache: "no-store" }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    const rows = (json?.attempts ?? []) as Attempt[]
    setAttempts(rows)
    setFeedbackDrafts(
      Object.fromEntries(rows.flatMap((a) => a.answers.map((ans) => [ans.id, ans.reviewerFeedback ?? ""])))
    )
    setCorrectDrafts(
      Object.fromEntries(rows.flatMap((a) => a.answers.map((ans) => [ans.id, ans.isCorrect === true])))
    )
    setAttemptsLoading(false)
  }

  const gradeAttempt = async (attempt: Attempt) => {
    setGradingAttemptId(attempt.id)
    try {
      const shortAnswers = attempt.answers.filter((a) => a.question.type === "short_answer")
      const res = await fetch(`${quizAttemptsApiBasePath}/${attempt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: shortAnswers.map((a) => ({
            answerId: a.id,
            isCorrect: correctDrafts[a.id] ?? false,
            reviewerFeedback: feedbackDrafts[a.id]?.trim() ? feedbackDrafts[a.id].trim() : null,
          })),
        }),
      }).catch(() => null)
      if (!res || !res.ok) throw new Error("Failed to grade attempt")
      toast({ title: "Attempt graded" })
      await openAttempts()
    } catch (e) {
      toast({ title: "Failed to grade attempt", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setGradingAttemptId(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!checking && hasQuiz ? (
        <>
          <Button variant="outline" size="sm" onClick={() => void openAttempts()} className="gap-1">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Attempts{attemptCount > 0 ? ` (${attemptCount})` : ""}
          </Button>
          <Button variant="outline" size="sm" onClick={() => void openEditor()}>
            Edit Quiz
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            }
            title="Delete quiz?"
            description="This permanently deletes the quiz, its questions, and all student attempts."
            confirmText="Delete"
            onConfirm={() => void deleteQuiz()}
          />
        </>
      ) : (
        <Button variant="outline" size="sm" onClick={() => void openEditor()} className="gap-1" disabled={checking}>
          <HelpCircle className="h-3.5 w-3.5" />
          Add Quiz
        </Button>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz for &quot;{lessonTitle}&quot;</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Quiz title</Label>
              <Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-3">
              {questions.map((q, index) => (
                <div key={q.key} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">Question {index + 1}</p>
                    <div className="flex items-center gap-2">
                      <Select
                        value={q.type}
                        onValueChange={(value) =>
                          updateQuestion(q.key, {
                            type: value as QuestionDraft["type"],
                            options: value === "multiple_choice" ? ["", ""] : q.options,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple choice</SelectItem>
                          <SelectItem value="short_answer">Short answer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(q.key)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    value={q.prompt}
                    onChange={(e) => updateQuestion(q.key, { prompt: e.target.value })}
                    placeholder="Question prompt"
                  />

                  {q.type === "multiple_choice" ? (
                    <div className="space-y-2">
                      {q.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.key}`}
                            checked={q.correctOption === optionIndex}
                            onChange={() => updateQuestion(q.key, { correctOption: optionIndex })}
                          />
                          <Input
                            value={option}
                            onChange={(e) => {
                              const nextOptions = [...q.options]
                              nextOptions[optionIndex] = e.target.value
                              updateQuestion(q.key, { options: nextOptions })
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="h-8"
                          />
                          {q.options.length > 2 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateQuestion(q.key, {
                                  options: q.options.filter((_, i) => i !== optionIndex),
                                  correctOption: q.correctOption >= optionIndex && q.correctOption > 0 ? q.correctOption - 1 : q.correctOption,
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}
                        </div>
                      ))}
                      {q.options.length < 6 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuestion(q.key, { options: [...q.options, ""] })}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add option
                        </Button>
                      ) : null}
                      <p className="text-xs text-muted-foreground">Select the radio button next to the correct option.</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Students type a free-text answer. You&apos;ll review and grade it manually after they submit.
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addQuestion} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              Save Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={attemptsOpen} onOpenChange={setAttemptsOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attempts for &quot;{lessonTitle}&quot;</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {attemptsLoading ? <p className="text-sm text-muted-foreground">Loading attempts...</p> : null}
            {!attemptsLoading && attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students have attempted this quiz yet.</p>
            ) : null}

            {attempts.map((attempt) => {
              const shortAnswers = attempt.answers.filter((a) => a.question.type === "short_answer")
              return (
                <div key={attempt.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{attempt.student.name}</p>
                      <p className="text-xs text-muted-foreground">{attempt.student.email}</p>
                    </div>
                    <Badge variant={attempt.gradedAt ? "default" : "outline"}>
                      Score: {attempt.score ?? 0} {attempt.gradedAt ? "" : "(pending review)"}
                    </Badge>
                  </div>

                  {shortAnswers.map((answer) => (
                    <div key={answer.id} className="space-y-2 rounded-md bg-muted/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground">{answer.question.prompt}</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{answer.textAnswer}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={correctDrafts[answer.id] ?? false}
                          onChange={(e) => setCorrectDrafts((prev) => ({ ...prev, [answer.id]: e.target.checked }))}
                        />
                        <Label className="text-xs">Mark correct</Label>
                      </div>
                      <Textarea
                        value={feedbackDrafts[answer.id] ?? ""}
                        onChange={(e) => setFeedbackDrafts((prev) => ({ ...prev, [answer.id]: e.target.value }))}
                        placeholder="Feedback for this answer..."
                        className="bg-background"
                      />
                    </div>
                  ))}

                  {shortAnswers.length > 0 ? (
                    <Button size="sm" onClick={() => void gradeAttempt(attempt)} disabled={gradingAttemptId === attempt.id}>
                      {attempt.gradedAt ? "Update grade" : "Grade attempt"}
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAttemptsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
