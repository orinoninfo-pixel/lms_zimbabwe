import { prisma } from "@/lib/prisma"
import { getSession, type SessionRole } from "@/lib/auth"

async function requireRole(allowedRoles: SessionRole[]) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (!allowedRoles.includes(session.role)) return Response.json({ error: "Forbidden" }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || !allowedRoles.includes(user.role)) return Response.json({ error: "Invalid session" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Account disabled" }, { status: 403 })

  return { session, user }
}

export async function requireAdmin() {
  return requireRole(["admin"])
}

export async function requireInternalInstructor() {
  return requireRole(["internal_instructor"])
}

export async function requireAdminOrInternalInstructor() {
  return requireRole(["admin", "internal_instructor"])
}

export async function requireRoleForPage(requiredRole: SessionRole | SessionRole[]) {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  const session = await getSession()
  if (!session) return null
  if (!allowedRoles.includes(session.role)) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true, name: true, email: true },
  })

  if (!user) return null
  if (user.status !== "active") return null
  if (!allowedRoles.includes(user.role)) return null

  return { session, user }
}
