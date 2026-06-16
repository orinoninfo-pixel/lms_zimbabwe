import Image from "next/image"
import Link from "next/link"
import { Play, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { headers } from "next/headers"

type MyCoursesResponse = {
  userId: string
  courses: Array<{
    id: string
    title: string
    description: string
    thumbnail: string
    instructorName: string
    progressPercent: number
  }>
}

export async function ContinueLearning() {
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

  const currentCourse = data?.courses?.[0] ?? null

  if (!currentCourse) {
    return null
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="relative md:w-80 aspect-video md:aspect-auto md:min-h-[200px] flex-shrink-0">
          <Image
            src={currentCourse.thumbnail}
            alt={currentCourse.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent flex items-center justify-center md:justify-start md:pl-8">
            <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
              <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Continue where you left off
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {currentCourse.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              by {currentCourse.instructorName}
            </p>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Next up</p>
              <p className="mt-1 font-medium text-foreground line-clamp-1">
                {currentCourse.description}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Keep going</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-medium text-foreground">{currentCourse.progressPercent}%</span>
            </div>
            <Progress value={currentCourse.progressPercent} className="h-2" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Continue your course
              </p>
              <Button asChild size="sm">
                <Link href={`/learn/${currentCourse.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
