"use client"

import { useState } from "react"
import { ChevronDown, PlayCircle, FileText, Lock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "article" | "quiz"
  isPreview: boolean
  isCompleted?: boolean
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface CourseCurriculumProps {
  sections: Section[]
  totalLessons: number
  totalDuration: string
}

export function CourseCurriculum({ sections, totalLessons, totalDuration }: CourseCurriculumProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([sections[0]?.id || ""])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const getLessonIcon = (type: Lesson["type"], isCompleted?: boolean) => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-accent" />
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4" />
      case "article":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Course Curriculum</h2>
        <p className="text-sm text-muted-foreground">
          {sections.length} sections &middot; {totalLessons} lessons &middot; {totalDuration}
        </p>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.includes(section.id)
          const sectionDuration = section.lessons.reduce((acc, lesson) => {
            const [mins] = lesson.duration.split(":")
            return acc + parseInt(mins, 10)
          }, 0)

          return (
            <div key={section.id} className={cn(index > 0 && "border-t border-border")}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{section.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {section.lessons.length} lessons &middot; {sectionDuration} min
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <ul className="divide-y divide-border">
                  {section.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {getLessonIcon(lesson.type, lesson.isCompleted)}
                          </span>
                          <span className={cn(
                            "text-sm",
                            lesson.isCompleted ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {lesson.title}
                          </span>
                          {lesson.isPreview && (
                            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                              Preview
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          {!lesson.isPreview && (
                            <Lock className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
