import Image from "next/image"
import Link from "next/link"
import { Play, Clock } from "lucide-react"
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
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-80 aspect-video md:aspect-auto md:min-h-[200px] flex-shrink-0">
          <Image
            src={currentCourse.thumbnail}
            alt={currentCourse.title}
            fill
            sizes="(min-width: 768px) 320px, 100vw"
            placeholder="blur"
            blurDataURL={THUMBNAIL_BLUR_DATA_URL}
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-foreground/60 to-transparent md:justify-start md:pl-8">
            <div className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md bg-primary/90 transition-colors hover:bg-primary">
              <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Continue where you left off
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {currentCourse.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              by {currentCourse.instructorName}
            </p>

            <div className="mt-4 rounded-md border border-border bg-muted/40 p-3">
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
