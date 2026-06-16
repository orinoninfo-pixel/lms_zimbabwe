import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ count: 0 })
  if (session.role !== "student") return Response.json({ count: 0 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student" || user.status !== "active") return Response.json({ count: 0 })

  const count = await prisma.notification.count({ where: { userId: user.id, readAt: null } })
  return Response.json({ count })
}
