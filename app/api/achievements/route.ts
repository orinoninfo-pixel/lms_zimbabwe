import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const definitions = [
  { code: "first_enrollment", name: "First Step", description: "Enroll in your first course.", icon: "trophy" },
  { code: "first_wishlist", name: "Wishlist Starter", description: "Save your first course to your wishlist.", icon: "heart" },
  { code: "ten_lessons", name: "On a Roll", description: "Complete 10 lessons across any courses.", icon: "zap" },
  { code: "first_certificate", name: "Course Finisher", description: "Earn your first certificate.", icon: "award" },
] as const

async function ensureStudent() {
  const session = await getSession()
  if (!session) return { error: Response.json({ error: "Not logged in" }, { status: 401 }) }
  if (session.role !== "student") return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student") return { error: Response.json({ error: "Invalid session" }, { status: 401 }) }
  if (user.status !== "active") return { error: Response.json({ error: "Account disabled" }, { status: 403 }) }

  return { user }
}

export async function GET() {
  const auth = await ensureStudent()
  if ("error" in auth) return auth.error

  const defs = []
  for (const d of definitions) {
    const row = await prisma.achievementDefinition.upsert({
      where: { code: d.code },
      update: { name: d.name, description: d.description, icon: d.icon },
      create: { code: d.code, name: d.name, description: d.description, icon: d.icon },
    })
    defs.push(row)
  }

  const [enrollmentsCount, favoritesCount, completedLessonsCount, certificatesCount] = await Promise.all([
    prisma.enrollment.count({ where: { userId: auth.user.id } }),
    prisma.favorite.count({ where: { userId: auth.user.id } }),
    prisma.progress.count({ where: { userId: auth.user.id, completed: true } }),
    prisma.certificate.count({ where: { userId: auth.user.id } }),
  ])

  const earnedCodes = new Set<string>()
  if (enrollmentsCount >= 1) earnedCodes.add("first_enrollment")
  if (favoritesCount >= 1) earnedCodes.add("first_wishlist")
  if (completedLessonsCount >= 10) earnedCodes.add("ten_lessons")
  if (certificatesCount >= 1) earnedCodes.add("first_certificate")

  const earnedDefs = defs.filter((d) => earnedCodes.has(d.code))
  for (const d of earnedDefs) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: auth.user.id, achievementId: d.id } },
      update: {},
      create: { userId: auth.user.id, achievementId: d.id },
    })
  }

  const rows = await prisma.achievementDefinition.findMany({
    include: {
      users: {
        where: { userId: auth.user.id },
        select: { earnedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const earned = []
  const locked = []
  for (const r of rows) {
    const earnedAt = r.users[0]?.earnedAt ?? null
    const item = { id: r.id, code: r.code, name: r.name, description: r.description, icon: r.icon, earnedAt }
    if (earnedAt) earned.push(item)
    else locked.push(item)
  }

  return Response.json({ earned, locked })
}
