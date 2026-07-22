"use client"

import { useEffect, useState } from "react"
import { Video, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Lesson = {
  id: string
  title: string
  status: "upcoming" | "completed" | "canceled"
  startsAt: string
  durationMinutes: number
  canJoin: boolean
  meetingLink: string | null
  recordingUrl: string | null
}

export function CourseLiveLessons({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setIsLoading(true)
      const res = await fetch(`/api/sa-hub/live-lessons?courseId=${courseId}`, {
        cache: "no-store",
        signal: controller.signal,
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      setLessons((json?.lessons ?? []) as Lesson[])
      setIsLoading(false)
    }
    void load()
    return () => controller.abort()
  }, [courseId])

  if (isLoading || lessons.length === 0) return null

  const upcoming = lessons.filter((l) => l.status === "upcoming")
  const past = lessons.filter((l) => l.status !== "upcoming")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Live Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[...upcoming, ...past].map((lesson) => {
          const when = new Date(lesson.startsAt)
          return (
            <div
              key={lesson.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{lesson.title}</p>
                  {lesson.status !== "upcoming" ? (
                    <Badge variant="outline" className="capitalize">
                      {lesson.status}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {when.toLocaleString("en-ZW", { dateStyle: "medium", timeStyle: "short" })} &middot;{" "}
                  {lesson.durationMinutes} min
                </div>
              </div>
              <div className="flex-shrink-0">
                {lesson.status === "upcoming" ? (
                  lesson.canJoin && lesson.meetingLink ? (
                    <Button asChild size="sm" className="gap-2">
                      <a href={lesson.meetingLink} target="_blank" rel="noreferrer">
                        <Video className="h-4 w-4" />
                        Join session
                      </a>
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">Enroll to get the join link</p>
                  )
                ) : lesson.recordingUrl && lesson.canJoin ? (
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <a href={lesson.recordingUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Watch recording
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
