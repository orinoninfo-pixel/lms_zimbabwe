import Image from "next/image"
import Link from "next/link"
import { Play, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { headers } from "next/headers"
import { THUMBNAIL_BLUR_DATA_URL } from "@/lib/utils"

type MyCoursesResponse = {
  userId: string
  courses: Array<{
    id: string
    title: string
    description: string
    price: number
    instructorId: string
    thumbnail: string
    instructorName: string
    progressPercent: number
    totalLessons: number
    completedLessons: number
    firstLessonId: string | null
  }>
}

export async function EnrolledCourses() {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  const baseUrl = host ? `${proto}://${host}` : ""
  const cookie = h.get("cookie") ?? ""

  const data: MyCoursesResponse | null = await fetch(`${baseUrl}/api/my-courses`, {
    cache: "no-store",
    headers: { cookie },
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  const enrolledCourses = data?.courses ?? []
  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">My Courses</h2>
          <Link
            href="/dashboard/courses"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <p className="text-sm text-muted-foreground">You have not enrolled in any courses yet.</p>
          <Link href="/courses" className="mt-4 inline-block text-sm text-primary hover:underline">Browse Courses</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">My Courses</h2>
        <Link
          href="/dashboard/courses"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {enrolledCourses.map((course) => (
          <article
            key={course.id}
            className="group overflow-hidden rounded-lg border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={THUMBNAIL_BLUR_DATA_URL}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/90">
                  <Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>
              {course.progressPercent >= 90 && (
                <span className="absolute right-3 top-3 rounded-sm bg-warning px-2.5 py-1 text-xs font-semibold text-warning-foreground">
                  Almost Done!
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground line-clamp-1">
                {course.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                by {course.instructorName}
              </p>

              {/* Progress */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{course.progressPercent}%</span>
                </div>
                <Progress value={course.progressPercent} className="h-2" />
              </div>

              {/* Stats */}
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{Math.max(1, Math.round(course.totalLessons / 2))} hours</span>
                </div>
              </div>

              {/* Continue Button */}
              <Button asChild className="mt-4 w-full" size="sm">
                <Link href={`/learn/${course.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
