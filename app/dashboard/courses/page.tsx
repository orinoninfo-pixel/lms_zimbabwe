import Link from "next/link"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { requireRoleForPage } from "@/lib/rbac"

export const dynamic = "force-dynamic"

export default async function DashboardCoursesPage() {
  const auth = await requireRoleForPage("student")
  if (!auth) redirect("/")

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: auth.user.id },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
        },
      },
    },
    orderBy: { id: "desc" },
  })

  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = enrollment.course
      const totalLessons = await prisma.lesson.count({
        where: { section: { courseId: course.id } },
      })
      const completedLessons = await prisma.progress.count({
        where: { userId: auth.user.id, completed: true, lesson: { section: { courseId: course.id } } },
      })
      const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)
      return {
        id: course.id,
        title: course.title,
        instructorName: course.instructor.name,
        totalLessons,
        completedLessons,
        percent,
      }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 lg:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">My Courses</h1>
                <p className="text-sm text-muted-foreground">All courses you are enrolled in</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">You have not enrolled in any courses yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {courses.map((course) => (
                  <div key={course.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{course.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">by {course.instructorName}</p>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/learn/${course.id}`}>Continue</Link>
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{course.percent}%</span>
                      </div>
                      <Progress value={course.percent} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {course.completedLessons}/{course.totalLessons} lessons completed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
