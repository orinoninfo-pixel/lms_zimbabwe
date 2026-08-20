import { prisma } from "@/lib/prisma"
import { getSession, type SessionRole } from "@/lib/auth"

export async function requireAuthenticatedUser() {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  return {
    session,
    user: { id: session.userId, role: session.role, status: "active" as const, name: session.name, email: session.email },
  }
}

export async function requireRole(...allowedRoles: SessionRole[]) {
  const auth = await requireAuthenticatedUser()
  if (auth instanceof Response) return auth
  if (!allowedRoles.includes(auth.user.role)) return Response.json({ error: "Forbidden" }, { status: 403 })
  return auth
}

export async function requireStudent() {
  return requireRole("student")
}

export async function requireInstructor() {
  return requireRole("instructor")
}

export async function requireAdmin() {
  return requireRole("admin")
}

export async function requireInternalInstructor() {
  return requireRole("internal_instructor")
}

export async function requireAdminOrInternalInstructor() {
  return requireRole("admin", "internal_instructor")
}

export async function requireRoleForPage(requiredRole: SessionRole | SessionRole[]) {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  const session = await getSession()
  if (!session) return null
  if (!allowedRoles.includes(session.role)) return null

  return {
    session,
    user: { id: session.userId, role: session.role, status: "active" as const, name: session.name, email: session.email },
  }
}
