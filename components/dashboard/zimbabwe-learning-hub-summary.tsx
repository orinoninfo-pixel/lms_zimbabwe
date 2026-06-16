import Link from "next/link"
import { BookOpen, Clock, Target, Trophy } from "lucide-react"
import { prisma } from "@/lib/prisma"

function formatDateTime(value: Date) {
  return value.toLocaleString("en-ZW")
}

function formatMonthly(amount: number) {
  return new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount) + "/month"
}

export async function ZimbabweLearningHubSummary({ userId }: { userId: string }) {
  const now = new Date()

  const enrollments = await prisma.subjectEnrollment.findMany({
    where: { userId },
    include: {
      subjectPackage: {
        select: {
          id: true,
          title: true,
          subject: true,
          grade: true,
          price: true,
          includesLiveLessons: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  })

  const activeEnrollments = enrollments.filter(
    (e) => e.status === "active" && (!e.endDate || e.endDate > now)
  )
  const activePackageIds = activeEnrollments.map((e) => e.subjectPackageId)
  const enrolledPackageIds = enrollments.map((e) => e.subjectPackageId)

  const [upcoming, pendingHomework, papersCount, holidayCount, recommended] = await Promise.all([
    activePackageIds.length
      ? prisma.liveLesson.findFirst({
          where: { startsAt: { gte: now }, status: "upcoming", subjectPackageId: { in: activePackageIds } },
          orderBy: { startsAt: "asc" },
          include: { teacher: { select: { name: true } } },
        })
      : null,
    activePackageIds.length
      ? prisma.homeworkAssignment.count({
          where: {
            subjectPackageId: { in: activePackageIds },
            dueAt: { gte: now },
            submissions: { none: { studentId: userId, status: { in: ["submitted", "graded"] } } },
          },
        })
      : 0,
    activePackageIds.length
      ? prisma.examResource.count({ where: { subjectPackageId: { in: activePackageIds } } })
      : 0,
    prisma.subjectPackage.count({
      where: { isHolidayLearning: true, ...(enrolledPackageIds.length ? { id: { notIn: enrolledPackageIds } } : {}) },
    }),
    prisma.subjectPackage.findMany({
      where: enrolledPackageIds.length ? { id: { notIn: enrolledPackageIds } } : {},
      orderBy: [{ grade: "asc" }, { subject: "asc" }],
      take: 4,
    }),
  ])

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Zimbabwe Learning Hub</h2>
        <Link href="/zimbabwe-learning-hub" className="text-sm text-accent hover:underline">
          Open hub
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={upcoming?.subjectPackageId ? `/zimbabwe-learning-hub/${upcoming.subjectPackageId}` : "/zimbabwe-learning-hub"}
          className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming live lesson</p>
              <p className="mt-1 text-sm font-semibold text-foreground line-clamp-2">
                {upcoming ? upcoming.title : "No upcoming lessons"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {upcoming
                  ? `${upcoming.subject} · Grade ${upcoming.grade} · ${formatDateTime(upcoming.startsAt)}`
                  : "Enroll to unlock live lessons"}
              </p>
            </div>
            <div className="rounded-lg p-2.5 bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link
          href="/zimbabwe-learning-hub"
          className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending homework</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{pendingHomework}</p>
              <p className="mt-1 text-xs text-muted-foreground">From paid/enrolled subjects</p>
            </div>
            <div className="rounded-lg p-2.5 bg-amber-100">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </Link>

        <Link
          href="/zimbabwe-learning-hub"
          className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Exam prep</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{papersCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Resources in paid subjects</p>
            </div>
            <div className="rounded-lg p-2.5 bg-emerald-100">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Link>

        <Link
          href="/zimbabwe-learning-hub"
          className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Holiday learning</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{holidayCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Subjects you can add</p>
            </div>
            <div className="rounded-lg p-2.5 bg-rose-100">
              <Trophy className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Active subscriptions</p>
            <p className="text-sm font-semibold text-foreground">{activeEnrollments.length}</p>
          </div>
          {activeEnrollments.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No active subject subscriptions yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {activeEnrollments.slice(0, 6).map((e) => (
                <Link
                  key={e.id}
                  href={`/zimbabwe-learning-hub/${e.subjectPackageId}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{e.subjectPackage.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Grade {e.subjectPackage.grade} · {formatMonthly(e.price)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-600">Active</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Recommended subjects</p>
            <Link href="/zimbabwe-learning-hub" className="text-sm text-accent hover:underline">
              Browse
            </Link>
          </div>
          {recommended.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No recommendations right now.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {recommended.map((p) => (
                <Link
                  key={p.id}
                  href={`/zimbabwe-learning-hub/${p.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.subject} · Grade {p.grade} · {formatMonthly(p.price)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Locked</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
