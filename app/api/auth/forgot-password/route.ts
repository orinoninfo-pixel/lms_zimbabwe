import { NextResponse } from "next/server"
import { z } from "zod"
import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import {
  EmailNotConfiguredError,
  buildPasswordResetUrl,
  isEmailDeliveryConfigured,
  sendPasswordResetEmail,
} from "@/lib/email"
import {
  assertForgotPasswordRateLimit,
  createPasswordResetTokenForUser,
  getClientIpAddress,
  getPasswordResetExpiryMinutes,
} from "@/lib/password-reset"

const BodySchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const genericSuccess = {
    success: true,
    message: "If an account exists for this email address, a password reset link has been sent.",
  }

  if (process.env.NODE_ENV === "production" && !isEmailDeliveryConfigured()) {
    return NextResponse.json(
      { error: "Password reset email is not configured yet. Please contact support." },
      { status: 503 }
    )
  }

  const email = parsed.data.email.toLowerCase()
  const ipAddress = getClientIpAddress(req)
  const user = await prisma.user.findUnique({ where: { email } })

  const rateLimit = await assertForgotPasswordRateLimit({
    email,
    ipAddress,
    userId: user?.id,
  })

  if (rateLimit.limited) {
    return NextResponse.json({ error: "Too many reset attempts. Please try again shortly." }, {
      status: 429,
      headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    })
  }

  if (!user) {
    const debugToken =
      process.env.NODE_ENV === "production"
        ? undefined
        : buildPasswordResetUrl(randomBytes(32).toString("base64url"))
    return NextResponse.json({
      ...genericSuccess,
      ...(debugToken ? { debugResetUrl: debugToken } : {}),
    })
  }

  const { rawToken } = await createPasswordResetTokenForUser(user.id)
  const expiresInMinutes = getPasswordResetExpiryMinutes()
  const resetUrl = buildPasswordResetUrl(rawToken)

  try {
    await sendPasswordResetEmail({
      toEmail: user.email,
      userName: user.name,
      resetUrl,
      expiresInMinutes,
    })
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      return NextResponse.json({ error: "Password reset email is not configured yet. Please contact support." }, { status: 503 })
    }

    console.error("[auth] Failed to send password reset email", {
      message: error instanceof Error ? error.message : "unknown_error",
      email: user.email,
    })
    return NextResponse.json({ error: "We could not send the reset email right now. Please try again shortly." }, { status: 502 })
  }

  return NextResponse.json(
    process.env.NODE_ENV === "production"
      ? genericSuccess
      : { ...genericSuccess, debugResetUrl: resetUrl }
  )
}
