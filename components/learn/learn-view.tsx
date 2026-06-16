"use client"

import { useEffect, useMemo, useState } from "react"
import { VideoPlayer } from "@/components/learn/video-player"
import { LessonSidebar } from "@/components/learn/lesson-sidebar"
import { LessonContent } from "@/components/learn/lesson-content"
import { Spinner } from "@/components/ui/spinner"

type ApiCourse = {
  id: string
  title: string
  description: string
  thumbnail: string
  sections: Array<{
    id: string
    title: string
    lessons: Array<{
      id: string
      title: string
      videoUrl: string
    }>
  }>
}

type CourseProgressResponse = {
  courseId: string
  userId: string
  percent: number
  totalLessons: number
  completedLessons: number
  completedLessonIds: string[]
}

export default function LearnView({
  slug,
  initialLessonId,
}: {
  slug: string
  initialLessonId?: string | null
}) {
  const [course, setCourse] = useState<ApiCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressPercent, setProgressPercent] = useState(0)
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetch(`/api/courses/${slug}`, { cache: "no-store" }),
          fetch(`/api/progress/${slug}`, { cache: "no-store" }),
        ])

        if (!courseRes.ok) throw new Error("Failed to load course")
        const courseJson: ApiCourse = await courseRes.json()

        let completedLessonIds: string[] = []
        let percent = 0
        if (progressRes.ok) {
          const progressJson: CourseProgressResponse = await progressRes.json()
          completedLessonIds = progressJson.completedLessonIds ?? []
          percent = progressJson.percent ?? 0
        }

        if (cancelled) return
        setCourse(courseJson)
        setCompletedLessons(new Set(completedLessonIds))
        setProgressPercent(percent)
        const firstLesson = courseJson.sections[0]?.lessons[0]?.id ?? null
        setCurrentLessonId((prev) => prev ?? initialLessonId ?? firstLesson)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load course")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, initialLessonId])

  const allLessons = useMemo(
    () => course?.sections.flatMap((s) => s.lessons) ?? [],
    [course]
  )

  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLessonId)
  const currentLesson = allLessons[currentLessonIndex]

  const sectionsWithCompletion = (course?.sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    lessons: section.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: "10:00",
      type: "video" as const,
      isCompleted: completedLessons.has(lesson.id),
    })),
  }))

  const handleMarkComplete = async () => {
    if (!currentLessonId) return
    const willComplete = !completedLessons.has(currentLessonId)
    setCompletedLessons((prev) => {
      const next = new Set(prev)
      if (willComplete) next.add(currentLessonId)
      else next.delete(currentLessonId)
      return next
    })
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLessonId, completed: willComplete }),
      })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.courseProgress?.percent != null) {
        setProgressPercent(json.courseProgress.percent)
      }
    } catch {}
  }

  const handleVideoComplete = async () => {
    if (!currentLessonId) return
    if (completedLessons.has(currentLessonId)) return
    setCompletedLessons((prev) => new Set(prev).add(currentLessonId))
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLessonId, completed: true }),
      })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.courseProgress?.percent != null) {
        setProgressPercent(json.courseProgress.percent)
      }
    } catch {}
  }

  const goToPrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonId(allLessons[currentLessonIndex - 1].id)
    }
  }

  const goToNext = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentLessonIndex + 1].id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!course || !currentLessonId || !currentLesson) return null

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row-reverse">
      {/* Sidebar */}
      <LessonSidebar
        courseTitle={course.title}
        sections={sectionsWithCompletion}
        currentLessonId={currentLessonId}
        onLessonSelect={setCurrentLessonId}
        progress={progressPercent}
      />

      {/* Main Content */}
      <main className="flex-1 lg:max-w-[calc(100%-20rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Video Player */}
          <VideoPlayer
            title={currentLesson.title}
            lessonNumber={currentLessonIndex + 1}
            videoUrl={currentLesson.videoUrl}
            onComplete={handleVideoComplete}
          />

          {/* Lesson Content */}
          <LessonContent
            lessonNumber={currentLessonIndex + 1}
            totalLessons={allLessons.length}
            title={currentLesson.title}
            description={course.description}
            isCompleted={completedLessons.has(currentLessonId)}
            onMarkComplete={handleMarkComplete}
            onPrevious={goToPrevious}
            onNext={goToNext}
            hasPrevious={currentLessonIndex > 0}
            hasNext={currentLessonIndex < allLessons.length - 1}
          />
        </div>
      </main>
    </div>
  )
}
