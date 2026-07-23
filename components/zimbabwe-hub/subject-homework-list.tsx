"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

type HomeworkItem = {
  id: string
  title: string
  description: string | null
  dueAt: string
  submission: {
    id: string
    status: "not_submitted" | "submitted" | "graded"
    answerText: string | null
    feedback: string | null
    submittedAt: string | null
  } | null
}

const statusColors: Record<string, string> = {
  not_submitted: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-700",
  graded: "bg-emerald-100 text-emerald-700",
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-ZW")
}

export function SubjectHomeworkList({ items, canSubmit }: { items: HomeworkItem[]; canSubmit: boolean }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [items_, setItems] = useState(items)

  const submit = async (assignmentId: string) => {
    const answerText = drafts[assignmentId]?.trim()
    if (!answerText) {
      toast({ title: "Write an answer before submitting" })
      return
    }
    setSubmitting(assignmentId)
    try {
      const res = await fetch("/api/sa-hub/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, answerText }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to submit homework")

      setItems((prev) =>
        prev.map((item) =>
          item.id === assignmentId
            ? {
                ...item,
                submission: {
                  id: json.submission.id,
                  status: json.submission.status,
                  answerText,
                  feedback: item.submission?.feedback ?? null,
                  submittedAt: json.submission.submittedAt,
                },
              }
            : item
        )
      )
      toast({ title: "Homework submitted" })
    } catch (e) {
      toast({ title: "Failed to submit homework", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setSubmitting(null)
    }
  }

  if (items_.length === 0) {
    return <p className="text-sm text-muted-foreground">No homework has been posted yet.</p>
  }

  return (
    <div className="space-y-3">
      {items_.map((item) => {
        const status = item.submission?.status ?? "not_submitted"
        return (
          <div key={item.id} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">Due: {formatDateTime(item.dueAt)}</p>
              </div>
              <Badge className={statusColors[status]}>{status.replace("_", " ")}</Badge>
            </div>

            {item.submission?.feedback ? (
              <div className="rounded-md bg-background p-3 text-sm">
                <p className="font-medium text-foreground">Tutor feedback</p>
                <p className="mt-1 text-muted-foreground">{item.submission.feedback}</p>
              </div>
            ) : null}

            {canSubmit && status !== "graded" ? (
              <div className="space-y-2">
                <Textarea
                  value={drafts[item.id] ?? item.submission?.answerText ?? ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Write your answer..."
                  className="bg-background"
                />
                <Button size="sm" onClick={() => void submit(item.id)} disabled={submitting === item.id}>
                  {status === "submitted" ? "Resubmit" : "Submit"}
                </Button>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
