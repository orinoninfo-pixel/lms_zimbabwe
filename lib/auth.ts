import { createHash, randomBytes } from "crypto"
import { cookies, headers } from "next/headers"
import type { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export type SessionRole = "student" | "instructor" | "admin" | "internal_instructor"

export type Session = {
  id: string
  userId: string
  role: SessionRole
  name: string
  email: string
}

export const SESSION_COOKIE_NAME = "dzidza_session"
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
const SESSION_TOUCH_INTERVAL_MS = 15 * 60 * 1000

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function hashIpAddress(ip: string) {
  return createHash("sha256").update(ip).digest("hex")
}

function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}

export async function createSession(userId: string, req?: Request) {
  const token = randomBytes(32).toString("base64url")
  const tokenHash = hashSessionToken(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)
  const requestHeaders = req?.headers ?? (await headers())
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
  const ip = forwardedFor || requestHeaders.get("x-real-ip")?.trim()

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: requestHeaders.get("user-agent")?.slice(0, 500) || null,
      ipHash: ip ? hashIpAddress(ip) : null,
    },
  })

  return { token, expiresAt }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions())
  response.cookies.set("lms_user_id", "", sessionCookieOptions(0))
  response.cookies.set("lms_role", "", sessionCookieOptions(0))
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", sessionCookieOptions(0))
  response.cookies.set("lms_user_id", "", sessionCookieOptions(0))
  response.cookies.set("lms_role", "", sessionCookieOptions(0))
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return
  await prisma.session.updateMany({
    where: { tokenHash: hashSessionToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token || token.length < 32) return null

  const now = new Date()
  const record = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      revokedAt: true,
      lastUsedAt: true,
      user: { select: { role: true, status: true, name: true, email: true } },
    },
  })

  if (!record || record.revokedAt || record.expiresAt <= now || record.user.status !== "active") return null

  if (now.getTime() - record.lastUsedAt.getTime() >= SESSION_TOUCH_INTERVAL_MS) {
    void prisma.session.update({ where: { id: record.id }, data: { lastUsedAt: now } }).catch(() => undefined)
  }

  return {
    id: record.id,
    userId: record.userId,
    role: record.user.role,
    name: record.user.name,
    email: record.user.email,
  }
}
