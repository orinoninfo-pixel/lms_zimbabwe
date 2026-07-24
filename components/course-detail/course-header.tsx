import { Star, Users, Clock, PlayCircle, Award, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CourseHeaderProps {
  course: {
    title: string
    subtitle: string
    instructor: {
      name: string
      title: string
      avatar: string
    }
    rating: number
    reviewCount: number
    students: number
    lastUpdated: string
    language: string
    category: string
  }
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <section className="rounded-xl border border-primary/20 bg-primary text-primary-foreground shadow-xs lg:rounded-2xl">
      <div className="px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            {course.category}
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-balance leading-tight">
            {course.title}
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed">
            {course.subtitle}
          </p>
          
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-amber-400">{course.rating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(course.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-primary-foreground/30 text-primary-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-primary-foreground/70">
                ({course.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-primary-foreground/70">
              <Users className="h-4 w-4" />
              <span>{course.students.toLocaleString()} students</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-semibold">
              {course.instructor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-medium">{course.instructor.name}</p>
              <p className="text-sm text-primary-foreground/70">{course.instructor.title}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Last updated {course.lastUpdated}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span>{course.language}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              <span>Certificate of completion</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
