import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, CalendarDays, FileText, GraduationCap, Megaphone, Video } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ZimbabweSubjectEnrollmentActions } from "@/components/zimbabwe-hub/subject-enrollment-actions"
import { SubjectCurriculum } from "@/components/zimbabwe-hub/subject-curriculum"
import { SubjectHomeworkList } from "@/components/zimbabwe-hub/subject-homework-list"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatZimLevel, formatExaminingBody } from "@/lib/zim-education"

export const dynamic = "force-dynamic"

function formatMonthly(amount: number) {
  return new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount) + "/month"
}

function formatDateTime(value: Date) {
  return value.toLocaleString("en-ZW")
}

export default async function ZimbabweLearningHubPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getSession()
  const studentId = session?.role === "student" ? session.userId : null

  const pkg = await prisma.subjectPackage.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true } },
      liveLessons: { orderBy: { startsAt: "asc" }, take: 50 },
      homework: {
        orderBy: { dueAt: "asc" },
        take: 50,
        include: {
          submissions: { where: { studentId: studentId ?? "no-session" }, take: 1 },
        },
      },
      examResources: { orderBy: [{ year: "desc" }, { createdAt: "desc" }], take: 100 },
      resources: { orderBy: { createdAt: "desc" }, take: 100 },
      announcements: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
      sections: {
        orderBy: [{ order: "asc" as const }, { title: "asc" as const }],
        include: {
          lessons: {
            orderBy: [{ order: "asc" as const }, { title: "asc" as const }],
            select: { id: true, title: true, quiz: { select: { id: true } } },
          },
        },
      },
    },
  })

  if (!pkg) notFound()

  let enrollment: { status: string; endDate: string | null; price: number; billingPeriod: string } | null = null
  let hasActiveAccess = false

  if (studentId) {
    const e = await prisma.subjectEnrollment.findUnique({
      where: { userId_subjectPackageId: { userId: studentId, subjectPackageId: pkg.id } },
      select: { status: true, endDate: true, price: true, billingPeriod: true },
    })
    if (e) {
      enrollment = {
        status: e.status,
        endDate: e.endDate ? e.endDate.toISOString() : null,
        price: e.price,
        billingPeriod: e.billingPeriod,
      }
      hasActiveAccess = e.status === "active" && (!e.endDate || e.endDate > new Date())
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="border-b border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 md:py-14">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">Zimbabwe Learning Hub</Badge>
                  <Badge variant="outline">{formatExaminingBody(pkg.examiningBody)}</Badge>
                  {pkg.includesLiveLessons ? <Badge>Live lessons</Badge> : null}
                  {pkg.isExamPrep ? <Badge variant="outline">Exam prep</Badge> : null}
                  {pkg.isHolidayLearning ? <Badge variant="outline">Holiday learning</Badge> : null}
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {pkg.title || `${pkg.subject} · ${formatZimLevel(pkg.grade)}`}
                </h1>
                <p className="mt-4 text-base text-muted-foreground">{pkg.description}</p>
                <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <span>Subject: {pkg.subject}</span>
                  <span>Level: {formatZimLevel(pkg.grade)}</span>
                  <span>Term: {pkg.term ?? "Flexible"}</span>
                  <span>Teacher: {pkg.teacher?.name ?? "To be announced"}</span>
                </div>
              </div>

              <Card className="w-full lg:max-w-sm">
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{formatMonthly(pkg.price)}</p>
                    <p className="text-sm text-muted-foreground">Flexible monthly access for this subject package.</p>
                  </div>

                  {session?.role === "student" ? (
                    <ZimbabweSubjectEnrollmentActions packageId={pkg.id} initialStatus={enrollment?.status ?? null} />
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <Link href="/login">Log in as a student</Link>
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Student access is required to start or manage a subject subscription.
                      </p>
                    </div>
                  )}

                  {hasActiveAccess ? (
                    <p className="text-xs font-medium text-emerald-600">You currently have active access to this subject.</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-10">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="space-y-6 lg:col-span-2">
              {pkg.sections.length > 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <SubjectCurriculum
                      subjectPackageId={pkg.id}
                      sections={pkg.sections}
                      hasActiveAccess={hasActiveAccess}
                    />
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Live Lessons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pkg.liveLessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No live lessons scheduled yet.</p>
                  ) : (
                    pkg.liveLessons.map((lesson) => (
                      <div key={lesson.id} className="rounded-lg border border-border bg-muted/20 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{lesson.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(lesson.startsAt)} · {lesson.durationMinutes} minutes
                            </p>
                          </div>
                          <Badge variant={lesson.status === "upcoming" ? "secondary" : "outline"}>{lesson.status}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Homework
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SubjectHomeworkList
                    canSubmit={Boolean(studentId) && hasActiveAccess}
                    items={pkg.homework.map((item) => ({
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      dueAt: item.dueAt.toISOString(),
                      submission: item.submissions[0]
                        ? {
                            id: item.submissions[0].id,
                            status: item.submissions[0].status,
                            answerText: item.submissions[0].answerText,
                            feedback: item.submissions[0].feedback,
                            submittedAt: item.submissions[0].submittedAt
                              ? item.submissions[0].submittedAt.toISOString()
                              : null,
                          }
                        : null,
                    }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pkg.announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No announcements yet.</p>
                  ) : (
                    pkg.announcements.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border bg-muted/20 p-4">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {item.author?.name ?? "Zim Learning"} · {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Exam Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pkg.examResources.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No exam resources available yet.</p>
                  ) : (
                    pkg.examResources.slice(0, 8).map((item) => (
                      <div key={item.id} className="rounded-lg border border-border bg-muted/20 p-4">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.year ? `Year ${item.year}` : "Past paper"} · {item.subject}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pkg.resources.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No downloadable resources yet.</p>
                  ) : (
                    pkg.resources.slice(0, 8).map((item) => (
                      <div key={item.id} className="rounded-lg border border-border bg-muted/20 p-4">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.kind} · {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Access Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Subscribers get full access to live lessons, homework, exam resources, and announcements.</p>
                  <p>The current payment flow is test-based and uses the existing enrollment tables without schema changes.</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/zimbabwe-learning-hub">Back to hub</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
