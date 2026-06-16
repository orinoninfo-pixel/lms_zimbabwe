"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Save, Send, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/instructor/course-creator/step-indicator"
import { CourseDetailsForm } from "@/components/instructor/course-creator/course-details-form"
import { CurriculumBuilder, Section } from "@/components/instructor/course-creator/curriculum-builder"
import { PublishSettings } from "@/components/instructor/course-creator/publish-settings"

const steps = [
  { id: 1, name: "Course Details", description: "Basic information" },
  { id: 2, name: "Curriculum", description: "Sections & lessons" },
  { id: 3, name: "Publish", description: "Review & publish" },
]

export default function CreateCoursePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      const role = json?.session?.role
      const userId = json?.session?.userId
      if (!cancelled && (!userId || role !== "instructor")) router.replace("/")
    }
    check()
    return () => {
      cancelled = true
    }
  }, [router])

  const [courseDetails, setCourseDetails] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "",
    language: "",
    price: "",
    thumbnail: null as string | null,
  })

  const [sections, setSections] = useState<Section[]>([])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handlePublish = async () => {
    setIsSaving(true)
    setPublishError(null)
    try {
      const price = Number(courseDetails.price)
      const res = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseDetails.title,
          description: courseDetails.description,
          price: Number.isFinite(price) ? Math.round(price) : 0,
          sections: sections.map((s) => ({
            title: s.title,
            lessons: s.lessons.map((l) => ({
              title: l.title,
            })),
          })),
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setPublishError(data?.error ?? "Failed to publish course")
        return
      }
      router.push("/instructor")
    } finally {
      setIsSaving(false)
    }
  }

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)
  const isReadyToPublish =
    courseDetails.title.length > 0 &&
    courseDetails.description.length > 50 &&
    courseDetails.category.length > 0 &&
    courseDetails.level.length > 0 &&
    courseDetails.price.length > 0 &&
    sections.length > 0 &&
    totalLessons >= 3

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/instructor"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">Create Course</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            {currentStep === 3 && (
              <Button
                onClick={handlePublish}
                disabled={!isReadyToPublish || isSaving}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === 1 && (
            <CourseDetailsForm data={courseDetails} onChange={setCourseDetails} />
          )}

          {currentStep === 2 && (
            <CurriculumBuilder sections={sections} onChange={setSections} />
          )}

          {currentStep === 3 && (
            <PublishSettings courseDetails={courseDetails} sections={sections} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  currentStep === step.id
                    ? "bg-primary"
                    : currentStep > step.id
                    ? "bg-accent"
                    : "bg-border"
                }`}
              />
            ))}
          </div>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1))}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={!isReadyToPublish || isSaving}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Publish Course
            </Button>
          )}
        </div>
        {publishError ? <p className="mt-3 text-sm text-destructive">{publishError}</p> : null}
      </main>
    </div>
  )
}
