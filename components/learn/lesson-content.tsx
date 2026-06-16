"use client"

import { CheckCircle, ChevronLeft, ChevronRight, Download, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LessonContentProps {
  lessonNumber: number
  totalLessons: number
  title: string
  description: string
  isCompleted: boolean
  onMarkComplete: () => void
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious: boolean
  hasNext: boolean
  resources?: { name: string; size: string }[]
}

export function LessonContent({
  lessonNumber,
  totalLessons,
  title,
  description,
  isCompleted,
  onMarkComplete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  resources = [],
}: LessonContentProps) {
  return (
    <div className="py-6">
      {/* Lesson Info */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">
          Lesson {lessonNumber} of {totalLessons}
        </p>
        <h1 className="text-2xl font-bold text-foreground text-balance">{title}</h1>
      </div>

      {/* Description */}
      <div className="prose prose-sm max-w-none mb-8">
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Mark Complete Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <Button
          onClick={onMarkComplete}
          variant={isCompleted ? "outline" : "default"}
          className={cn(
            "gap-2",
            isCompleted && "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20"
          )}
        >
          <CheckCircle className={cn("h-4 w-4", isCompleted && "fill-accent")} />
          {isCompleted ? "Completed" : "Mark as Complete"}
        </Button>
        <Button variant="ghost" className="gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          Ask a Question
        </Button>
      </div>

      {/* Resources */}
      {resources.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-foreground mb-3">Lesson Resources</h3>
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {resource.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{resource.size}</p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Lesson
        </Button>
        <Button
          variant="default"
          onClick={onNext}
          disabled={!hasNext}
          className="gap-2"
        >
          Next Lesson
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
