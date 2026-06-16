"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CourseDescriptionProps {
  description: string
  whatYouWillLearn: string[]
  requirements: string[]
}

export function CourseDescription({ description, whatYouWillLearn, requirements }: CourseDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">What you&apos;ll learn</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {whatYouWillLearn.map((item, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5">
                <Check className="h-3 w-3 text-accent" />
              </div>
              <span className="text-sm text-foreground leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Description</h2>
        <div className="relative">
          <div
            className={cn(
              "prose prose-sm max-w-none text-muted-foreground leading-relaxed",
              !isExpanded && "line-clamp-4"
            )}
          >
            <p>{description}</p>
          </div>
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
          )}
        </div>
        <Button
          variant="link"
          className="p-0 h-auto mt-2 text-foreground font-medium"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : "Show more"}
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Requirements</h2>
        <ul className="space-y-2">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-foreground mt-1">&bull;</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
