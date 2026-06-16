"use client"

import { useState } from "react"
import {
  ChevronDown,
  PlayCircle,
  FileText,
  CheckCircle,
  Clock,
  ChevronLeft,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "article"
  isCompleted: boolean
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface LessonSidebarProps {
  courseTitle: string
  sections: Section[]
  currentLessonId: string
  onLessonSelect: (lessonId: string) => void
  progress: number
}

export function LessonSidebar({
  courseTitle,
  sections,
  currentLessonId,
  onLessonSelect,
  progress,
}: LessonSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.map((s) => s.id)
  )
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)
  const completedLessons = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.isCompleted).length,
    0
  )

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to course
        </a>
        <h2 className="font-semibold text-foreground line-clamp-2 text-balance">
          {courseTitle}
        </h2>
      </div>

      {/* Progress */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Your progress</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completedLessons} of {totalLessons} lessons completed
        </p>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.includes(section.id)
          const sectionCompleted = section.lessons.filter(
            (l) => l.isCompleted
          ).length
          const sectionTotal = section.lessons.length

          return (
            <div key={section.id} className="border-b border-border last:border-b-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                      isExpanded && "rotate-180"
                    )}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Section {sectionIndex + 1}
                    </p>
                    <h3 className="font-medium text-foreground text-sm">
                      {section.title}
                    </h3>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {sectionCompleted}/{sectionTotal}
                </span>
              </button>

              {isExpanded && (
                <ul>
                  {section.lessons.map((lesson, lessonIndex) => {
                    const isActive = lesson.id === currentLessonId
                    const globalIndex =
                      sections
                        .slice(0, sectionIndex)
                        .reduce((acc, s) => acc + s.lessons.length, 0) +
                      lessonIndex +
                      1

                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => {
                            onLessonSelect(lesson.id)
                            setIsMobileOpen(false)
                          }}
                          className={cn(
                            "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                            isActive
                              ? "bg-accent/10 border-l-2 border-accent"
                              : "hover:bg-muted/30 border-l-2 border-transparent"
                          )}
                        >
                          <span className="shrink-0 mt-0.5">
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-accent" />
                            ) : lesson.type === "video" ? (
                              <PlayCircle
                                className={cn(
                                  "h-4 w-4",
                                  isActive
                                    ? "text-accent"
                                    : "text-muted-foreground"
                                )}
                              />
                            ) : (
                              <FileText
                                className={cn(
                                  "h-4 w-4",
                                  isActive
                                    ? "text-accent"
                                    : "text-muted-foreground"
                                )}
                              />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm line-clamp-2",
                                isActive
                                  ? "text-foreground font-medium"
                                  : lesson.isCompleted
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                              )}
                            >
                              {globalIndex}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration}</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 lg:hidden shadow-lg"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open course menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 lg:right-auto h-screen w-80 bg-card border-l border-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
