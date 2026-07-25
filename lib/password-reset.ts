import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

const DEFAULT_EXPIRY_MINUTES = 30
const DEFAULT_RATE_LIMIT_WINDOW_MINUTES = 15
const DEFAULT_MAX_REQUESTS_PER_EMAIL = 3
const DEFAULT_MAX_REQUESTS_PER_IP = 15

const fallbackEmailRequestTimestamps = new Map<string, number[]>()
const fallbackIpRequestTimestamps = new Map<string, number[]>()

function getPrismaWithOptionalResetModels() {
  return prisma as typeof prisma & {
    passwordResetToken?: {
      updateMany: (...args: any[]) => Promise<any>
      create: (...args: any[]) => Promise<any>
      count: (...args: any[]) => Promise<any>
    }
    passwordResetRequest?: {
      count: (...args: any[]) => Promise<any>
      create: (...args: any[]) => Promise<any>
    }
  }
}

export function isPasswordResetTablesAvailable() {
  const p = getPrismaWithOptionalResetModels()
  return Boolean(p.passwordResetToken && p.passwordResetRequest)
}

function toPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function getPasswordResetExpiryMinutes() {
  return toPositiveInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES, DEFAULT_EXPIRY_MINUTES)
}

function getRateLimitWindowMinutes() {
  return toPositiveInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW_MINUTES, DEFAULT_RATE_LIMIT_WINDOW_MINUTES)
}

function getMaxRequestsPerEmail() {
  return toPositiveInt(process.env.PASSWORD_RESET_MAX_REQUESTS_PER_EMAIL, DEFAULT_MAX_REQUESTS_PER_EMAIL)
}

function getMaxRequestsPerIp() {
  return toPositiveInt(process.env.PASSWORD_RESET_MAX_REQUESTS_PER_IP, DEFAULT_MAX_REQUESTS_PER_IP)
}

function getTokenPepper() {
  return process.env.PASSWORD_RESET_TOKEN_PEPPER?.trim() || ""
}

export function hashResetToken(rawToken: string) {
  return createHash("sha256").update(`${rawToken}${getTokenPepper()}`).digest("hex")
}

function hashIdentifier(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

export function getClientIpAddress(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim()
    if (first) return first
  }

  const realIp = req.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp

  return "unknown"
}

export async function assertForgotPasswordRateLimit({
  email,
  ipAddress,
  userId,
}: {
  email: string
  ipAddress: string
  userId?: string
}) {
  const now = new Date()
  const windowMinutes = getRateLimitWindowMinutes()
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

  const emailHash = hashIdentifier(email)
  const ipHash = hashIdentifier(ipAddress)

  if (!isPasswordResetTablesAvailable()) {
    const nowMs = now.getTime()
    const windowMs = windowMinutes * 60 * 1000

    const emailTimes = (fallbackEmailRequestTimestamps.get(emailHash) || []).filter((ts) => nowMs - ts <= windowMs)
    const ipTimes = (fallbackIpRequestTimestamps.get(ipHash) || []).filter((ts) => nowMs - ts <= windowMs)

    if (emailTimes.length >= getMaxRequestsPerEmail() || ipTimes.length >= getMaxRequestsPerIp()) {
      fallbackEmailRequestTimestamps.set(emailHash, emailTimes)
      fallbackIpRequestTimestamps.set(ipHash, ipTimes)
      return {
        limited: true,
        retryAfterSeconds: windowMinutes * 60,
      }
    }

    emailTimes.push(nowMs)
    ipTimes.push(nowMs)
    fallbackEmailRequestTimestamps.set(emailHash, emailTimes)
    fallbackIpRequestTimestamps.set(ipHash, ipTimes)

    return {
      limited: false,
      retryAfterSeconds: 0,
    }
  }

  const p = getPrismaWithOptionalResetModels()

  const [emailCount, ipCount] = await Promise.all([
    p.passwordResetRequest!.count({ where: { emailHash, createdAt: { gte: windowStart } } }),
    p.passwordResetRequest!.count({ where: { ipHash, createdAt: { gte: windowStart } } }),
  ])

  if (emailCount >= getMaxRequestsPerEmail() || ipCount >= getMaxRequestsPerIp()) {
    return {
      limited: true,
      retryAfterSeconds: windowMinutes * 60,
    }
  }

  await p.passwordResetRequest!.create({
    data: {
      userId,
      emailHash,
      ipHash,
    },
  })

  return {
    limited: false,
    retryAfterSeconds: 0,
  }
}

export async function createPasswordResetTokenForUser(userId: string) {
  const rawToken = randomBytes(32).toString("base64url")
  const tokenHash = hashResetToken(rawToken)
  const expiresAt = new Date(Date.now() + getPasswordResetExpiryMinutes() * 60 * 1000)
  const now = new Date()

  if (!isPasswordResetTablesAvailable()) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: tokenHash,
        resetTokenExpiresAt: expiresAt,
      },
    })

    return {
      rawToken,
      expiresAt,
    }
  }

  await prisma.$transaction(async (tx) => {
    const txAny = tx as typeof tx & {
      passwordResetToken: {
        updateMany: (...args: any[]) => Promise<any>
        create: (...args: any[]) => Promise<any>
      }
    }

    await txAny.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
        invalidatedAt: null,
      },
      data: { invalidatedAt: now },
    })

    await txAny.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: {
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    })
  })

  return {
    rawToken,
    expiresAt,
  }
}

export function validatePasswordPolicy(password: string) {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters." }
  }

  return { valid: true as const }
}
