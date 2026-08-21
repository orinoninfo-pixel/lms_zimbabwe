import { prisma } from "@/lib/prisma"

export async function getStudentDashboardStats(userId: string) {
  const enrollments = await prisma.enrollment.findMany({ where: { userId }, select: { courseId: true } })
  const courseIds = enrollments.map((enrollment) => enrollment.courseId)

  const [totalLessons, completedLessons, certificateCount] = await Promise.all([
    courseIds.length ? prisma.lesson.count({ where: { section: { courseId: { in: courseIds } } } }) : 0,
    courseIds.length
      ? prisma.progress.count({ where: { userId, completed: true, lesson: { section: { courseId: { in: courseIds } } } } })
      : 0,
    prisma.certificate.count({ where: { userId } }),
  ])

  return {
    enrolledCourses: enrollments.length,
    hoursLearned: Math.round(completedLessons * 0.5 * 10) / 10,
    certificates: certificateCount,
    completionRate: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
  }
}

export type RecentActivityItem = {
  id: string
  type: "completed" | "enrolled" | "achievement"
  title: string
  subtitle: string
  time: Date
}

export async function getStudentRecentActivity(userId: string, limit = 5): Promise<RecentActivityItem[]> {
  const [completions, enrollments, achievements] = await Promise.all([
    prisma.progress.findMany({
      where: { userId, completed: true },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, updatedAt: true, lesson: { select: { title: true, section: { select: { course: { select: { title: true } } } } } } },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, createdAt: true, course: { select: { title: true } } },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
      take: limit,
      select: { id: true, earnedAt: true, achievement: { select: { name: true } } },
    }),
  ])

  const items: RecentActivityItem[] = [
    ...completions.map((completion) => ({
      id: `completed-${completion.id}`,
      type: "completed" as const,
      title: `Completed: ${completion.lesson.title}`,
      subtitle: completion.lesson.section.course.title,
      time: completion.updatedAt,
    })),
    ...enrollments.map((enrollment) => ({
      id: `enrolled-${enrollment.id}`,
      type: "enrolled" as const,
      title: `Enrolled in: ${enrollment.course.title}`,
      subtitle: "New course",
      time: enrollment.createdAt,
    })),
    ...achievements.map((achievement) => ({
      id: `achievement-${achievement.id}`,
      type: "achievement" as const,
      title: `Earned: ${achievement.achievement.name}`,
      subtitle: "Achievement unlocked",
      time: achievement.earnedAt,
    })),
  ]

  return items.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, limit)
}
