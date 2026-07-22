import { cookies } from "next/headers"

export type SessionRole = "student" | "instructor" | "admin" | "internal_instructor"

export type Session = {
  userId: string
  role: SessionRole
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const SESSION_ROLES: SessionRole[] = ["student", "instructor", "admin", "internal_instructor"]

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("lms_user_id")?.value ?? null
  const role = cookieStore.get("lms_role")?.value ?? null

  if (!userId || !UUID_REGEX.test(userId)) return null
  if (!role || !SESSION_ROLES.includes(role as SessionRole)) return null

  return { userId, role: role as SessionRole }
}
