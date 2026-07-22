import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseHeader } from "@/components/course-detail/course-header"
import { CoursePaymentBanner } from "@/components/course-detail/course-payment-banner"
import { VideoPreview } from "@/components/course-detail/video-preview"
import { CourseCurriculum } from "@/components/course-detail/course-curriculum"
import { CourseLiveLessons } from "@/components/course-detail/course-live-lessons"
import { CourseSidebar } from "@/components/course-detail/course-sidebar"
import { CourseDescription } from "@/components/course-detail/course-description"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Eye } from "lucide-react"

type ApiCourse = {
  id: string
  title: string
  description: string
  price: number
  instructorId: string
  thumbnail: string
  instructor: { id: string; name: string; email: string; role: string }
  sections: Array<{
    id: string
    courseId: string
    title: string
    order: number
    lessons: Array<{
      id: string
      sectionId: string
      title: string
      videoUrl: string
      order: number
    }>
  }>
}

type SearchParams = {
  payment?: string | string[]
  reference?: string | string[]
  adminPreview?: string | string[]
}

function getFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}) {
  const { slug } = await params
  const query = await searchParams
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  const cookie = h.get("cookie") ?? ""
  const baseUrl = host ? `${proto}://${host}` : ""

  const course: ApiCourse | null = await fetch(`${baseUrl}/api/courses/${slug}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  if (!course) notFound()

  const curriculumSections = course.sections.map((section) => ({
    id: section.id,
    title: section.title,
    lessons: section.lessons.map((lesson, idx) => ({
      id: lesson.id,
      title: lesson.title,
      duration: "10:00",
      type: "video" as const,
      isPreview: idx === 0,
    })),
  }))

  const totalLessons = curriculumSections.reduce((acc, section) => acc + section.lessons.length, 0)

  const courseHeaderData = {
    title: course.title,
    subtitle: course.description,
    instructor: {
      name: course.instructor.name,
      title: "Instructor",
      avatar: "",
    },
    rating: 4.8,
    reviewCount: 0,
    students: 0,
    lastUpdated: "June 2026",
    language: "English",
    category: "Online Course",
  }

  const descriptionData = {
    description: course.description,
    whatYouWillLearn: [
      "Learn by building real projects",
      "Understand key concepts step-by-step",
      "Practice with hands-on lessons",
      "Track your progress as you complete lessons",
    ],
    requirements: ["Basic computer skills", "A willingness to learn"],
  }

  const originalPrice = Math.max(course.price * 2, course.price)
  const discount = originalPrice === 0 ? 0 : Math.round(((originalPrice - course.price) / originalPrice) * 100)
  const sidebarData = {
    courseId: course.id,
    price: course.price,
    originalPrice,
    discount,
    features: {
      videoHours: `${Math.max(1, Math.round(totalLessons / 2))} hours`,
      articles: 0,
      resources: 0,
      certificate: true,
      lifetime: true,
      mobile: true,
    },
  }

  const paymentStatus = getFirst(query.payment)
  const paymentReference = getFirst(query.reference)
  const adminPreview = getFirst(query.adminPreview)
  const showPaymentBanner = paymentStatus === "confirmed"
  const showAdminPreviewBanner = adminPreview === "1"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <CourseHeader course={courseHeaderData} />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {showAdminPreviewBanner ? (
            <div className="mb-6">
              <Alert className="border-blue-200 bg-blue-50 text-blue-950 [&>svg]:text-blue-600">
                <Eye className="h-4 w-4" />
                <AlertTitle>Admin preview</AlertTitle>
                <AlertDescription>
                  You are previewing this course as an administrator, including content that may not be publicly approved yet.
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
          {showPaymentBanner ? (
            <div className="mb-6">
              <CoursePaymentBanner courseId={course.id} reference={paymentReference} />
            </div>
          ) : null}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2 space-y-10">
              <div className="lg:hidden">
                <CourseSidebar {...sidebarData} />
              </div>
              
              <VideoPreview 
                thumbnailUrl={course.thumbnail} 
                duration="2:34" 
              />
              
              <CourseDescription {...descriptionData} />
              
              <CourseCurriculum
                sections={curriculumSections}
                totalLessons={totalLessons}
                totalDuration="52h 30m"
              />

              <CourseLiveLessons courseId={course.id} />
            </div>
            
            <div className="hidden lg:block">
              <CourseSidebar {...sidebarData} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
