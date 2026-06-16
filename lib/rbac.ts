import { prisma } from "@/lib/prisma"
import { getSession, type SessionRole } from "@/lib/auth"

export async function requireAdmin() {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "admin") return Response.json({ error: "Invalid session" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Account disabled" }, { status: 403 })

  return { session, user }
}

export async function requireRoleForPage(requiredRole: SessionRole) {
  const session = await getSession()
  if (!session) return null
  if (session.role !== requiredRole) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true, name: true, email: true },
  })

  if (!user) return null
  if (user.status !== "active") return null
  if (user.role !== requiredRole) return null

  return { session, user }
}
