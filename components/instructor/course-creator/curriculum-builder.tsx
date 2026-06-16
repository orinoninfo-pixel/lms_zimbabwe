"use client"

import { useState } from "react"
import {
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  Pencil,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface Lesson {
  id: string
  title: string
  type: "video" | "text"
  duration: string
  isPreview: boolean
}

export interface Section {
  id: string
  title: string
  lessons: Lesson[]
  isExpanded: boolean
}

interface CurriculumBuilderProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
}

export function CurriculumBuilder({ sections, onChange }: CurriculumBuilderProps) {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}: New Section`,
      lessons: [],
      isExpanded: true,
    }
    onChange([...sections, newSection])
  }

  const removeSection = (sectionId: string) => {
    onChange(sections.filter((s) => s.id !== sectionId))
  }

  const toggleSection = (sectionId: string) => {
    onChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
      )
    )
  }

  const updateSectionTitle = (sectionId: string, title: string) => {
    onChange(
      sections.map((s) => (s.id === sectionId ? { ...s, title } : s))
    )
    setEditingSectionId(null)
  }

  const addLesson = (sectionId: string, type: "video" | "text") => {
    onChange(
      sections.map((s) => {
        if (s.id === sectionId) {
          const newLesson: Lesson = {
            id: `lesson-${Date.now()}`,
            title: type === "video" ? "New Video Lesson" : "New Text Lesson",
            type,
            duration: type === "video" ? "0:00" : "5 min read",
            isPreview: false,
          }
          return { ...s, lessons: [...s.lessons, newLesson] }
        }
        return s
      })
    )
  }

  const removeLesson = (sectionId: string, lessonId: string) => {
    onChange(
      sections.map((s) => {
        if (s.id === sectionId) {
          return { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
        }
        return s
      })
    )
  }

  const updateLesson = (sectionId: string, lessonId: string, updates: Partial<Lesson>) => {
    onChange(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId ? { ...l, ...updates } : l
            ),
          }
        }
        return s
      })
    )
    setEditingLessonId(null)
  }

  const startEditingSection = (sectionId: string, currentTitle: string) => {
    setEditingSectionId(sectionId)
    setEditValue(currentTitle)
  }

  const startEditingLesson = (lessonId: string, currentTitle: string) => {
    setEditingLessonId(lessonId)
    setEditValue(currentTitle)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Course Curriculum</h3>
          <p className="text-sm text-muted-foreground">
            Organize your course into sections and lessons
          </p>
        </div>
        <Button onClick={addSection} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">No sections yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding your first section
          </p>
          <Button onClick={addSection} variant="outline">
            Add First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <button
                  onClick={() => toggleSection(section.id)}
                  className="p-1 hover:bg-muted rounded"
                >
                  {section.isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                
                {editingSectionId === section.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateSectionTitle(section.id, editValue)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingSectionId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium text-foreground">{section.title}</span>
                    <button
                      onClick={() => startEditingSection(section.id, section.title)}
                      className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )}

                <span className="text-sm text-muted-foreground">
                  {section.lessons.length} lesson{section.lessons.length !== 1 && "s"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSection(section.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Section Content */}
              {section.isExpanded && (
                <div className="p-4">
                  {section.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No lessons in this section. Add your first lesson below.
                    </p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 group"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            lesson.type === "video" ? "bg-accent/20" : "bg-primary/10"
                          )}>
                            {lesson.type === "video" ? (
                              <Video className="h-4 w-4 text-accent" />
                            ) : (
                              <FileText className="h-4 w-4 text-primary" />
                            )}
                          </div>

                          {editingLessonId === lesson.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  updateLesson(section.id, lesson.id, { title: editValue })
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingLessonId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                                <button
                                  onClick={() => startEditingLesson(lesson.id, lesson.title)}
                                  className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration}
                              </span>
                            </div>
                          )}

                          <button
                            onClick={() =>
                              updateLesson(section.id, lesson.id, {
                                isPreview: !lesson.isPreview,
                              })
                            }
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium transition-colors",
                              lesson.isPreview
                                ? "bg-accent/20 text-accent"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            {lesson.isPreview ? "Preview" : "Locked"}
                          </button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLesson(section.id, lesson.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addLesson(section.id, "video")}
                      className="gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Add Video
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addLesson(section.id, "text")}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Add Text
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
