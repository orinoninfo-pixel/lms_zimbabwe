"use client"

import { Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Section {
  id: string
  title: string
  lessons: { id: string }[]
}

interface CourseDetails {
  title: string
  subtitle: string
  description: string
  category: string
  level: string
  language: string
  price: string
  thumbnail: string | null
}

interface PublishSettingsProps {
  courseDetails: CourseDetails
  sections: Section[]
}

interface ChecklistItem {
  id: string
  label: string
  description: string
  isComplete: boolean
}

export function PublishSettings({ courseDetails, sections }: PublishSettingsProps) {
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)

  const checklist: ChecklistItem[] = [
    {
      id: "title",
      label: "Course title",
      description: "Add a descriptive title for your course",
      isComplete: courseDetails.title.length > 0,
    },
    {
      id: "description",
      label: "Course description",
      description: "Explain what students will learn",
      isComplete: courseDetails.description.length > 50,
    },
    {
      id: "category",
      label: "Category selected",
      description: "Choose a category for your course",
      isComplete: courseDetails.category.length > 0,
    },
    {
      id: "level",
      label: "Level specified",
      description: "Set the difficulty level",
      isComplete: courseDetails.level.length > 0,
    },
    {
      id: "price",
      label: "Price set",
      description: "Set a price for your course",
      isComplete: courseDetails.price.length > 0 && parseFloat(courseDetails.price) > 0,
    },
    {
      id: "sections",
      label: "At least one section",
      description: "Organize your content into sections",
      isComplete: sections.length > 0,
    },
    {
      id: "lessons",
      label: "At least 3 lessons",
      description: "Add lessons to your course",
      isComplete: totalLessons >= 3,
    },
  ]

  const completedCount = checklist.filter((item) => item.isComplete).length
  const isReadyToPublish = completedCount === checklist.length

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Submission Checklist</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Complete all items before submitting your course for admin review
        </p>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {completedCount} of {checklist.length} complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${(completedCount / checklist.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                item.isComplete
                  ? "border-accent/30 bg-accent/5"
                  : "border-border bg-background"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  item.isComplete
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    item.isComplete ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Summary */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Course Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Title</span>
            <span className="font-medium text-foreground">
              {courseDetails.title || "Not set"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium text-foreground capitalize">
              {courseDetails.category.replace("-", " ") || "Not set"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Level</span>
            <span className="font-medium text-foreground capitalize">
              {courseDetails.level.replace("-", " ") || "Not set"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium text-foreground">
              {courseDetails.price ? `$${courseDetails.price}` : "Not set"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Sections</span>
            <span className="font-medium text-foreground">{sections.length}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Lessons</span>
            <span className="font-medium text-foreground">{totalLessons}</span>
          </div>
        </div>
      </div>

      {/* Publish Status */}
      <div
        className={cn(
          "rounded-xl border-2 p-6",
          isReadyToPublish
            ? "border-accent bg-accent/5"
            : "border-amber-500/30 bg-amber-500/5"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              isReadyToPublish ? "bg-accent" : "bg-amber-500"
            )}
          >
            {isReadyToPublish ? (
              <Check className="h-5 w-5 text-accent-foreground" />
            ) : (
              <AlertCircle className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              {isReadyToPublish ? "Ready to submit!" : "Not ready to submit"}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {isReadyToPublish
                ? "Your course meets all requirements. Click Submit for Review to send it to the Zim Learning team — it goes live once approved."
                : `Complete ${checklist.length - completedCount} more item${
                    checklist.length - completedCount > 1 ? "s" : ""
                  } before submitting.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
