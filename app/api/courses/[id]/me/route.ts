import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await context.params

  const session = await getSession()
  if (!session) {
    return Response.json({ loggedIn: false, enrolled: false, favorited: false })
  }
  if (session.role !== "student") {
    return Response.json({ loggedIn: true, enrolled: false, favorited: false })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } })
  if (!user || user.role !== "student") {
    return Response.json({ loggedIn: false, enrolled: false, favorited: false })
  }

  const [enrollment, favorite] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { id: true },
    }),
    prisma.favorite.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { id: true },
    }),
  ])

  return Response.json({
    loggedIn: true,
    enrolled: Boolean(enrollment),
    favorited: Boolean(favorite),
  })
}

