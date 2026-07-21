"use client"

import Image from "next/image"
import { Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface CourseDetailsFormProps {
  data: CourseDetails
  onChange: (data: CourseDetails) => void
}

const categories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "UI/UX Design",
  "Business",
  "Marketing",
]

const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"]
const languages = ["English", "Spanish", "French", "German", "Portuguese", "Japanese", "Korean", "Chinese"]

export function CourseDetailsForm({ data, onChange }: CourseDetailsFormProps) {
  const handleChange = (field: keyof CourseDetails, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              placeholder="e.g., Complete React Developer Course"
              value={data.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Make it specific and appealing. 60 characters recommended.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Course Subtitle</Label>
            <Input
              id="subtitle"
              placeholder="e.g., Master React, Redux, Hooks with hands-on projects"
              value={data.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course..."
              rows={5}
              value={data.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Include key topics, learning outcomes, and who this course is for.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Course Details</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={data.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase().replace(" ", "-")}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Level</Label>
            <Select value={data.level} onValueChange={(value) => handleChange("level", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level.toLowerCase().replace(" ", "-")}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={data.language} onValueChange={(value) => handleChange("language", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language} value={language.toLowerCase()}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              placeholder="49.99"
              min="0"
              step="0.01"
              value={data.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Course Thumbnail</h3>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex h-40 w-full sm:w-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 overflow-hidden">
            {data.thumbnail ? (
              <Image
                src={data.thumbnail}
                alt="Course thumbnail"
                fill
                sizes="256px"
                className="rounded-lg object-cover"
                unoptimized={data.thumbnail.startsWith("blob:") || data.thumbnail.startsWith("data:")}
              />
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No image uploaded</p>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload a high-quality image that represents your course. Recommended size: 1280x720 pixels.
            </p>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
