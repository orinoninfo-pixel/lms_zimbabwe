import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import {
  EmailNotConfiguredError,
  buildPasswordResetUrl,
  isEmailDeliveryConfigured,
  sendPasswordResetEmail,
} from "@/lib/email"

const BodySchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (process.env.NODE_ENV === "production" && !isEmailDeliveryConfigured()) {
    return NextResponse.json(
      { error: "Password reset email is not configured yet. Please contact support." },
      { status: 503 }
    )
  }

  const email = parsed.data.email.toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ success: true })
  }

  const token = randomBytes(24).toString("hex")
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiresAt: expiresAt },
  })

  const resetUrl = buildPasswordResetUrl(token)

  try {
    await sendPasswordResetEmail({
      toEmail: user.email,
      userName: user.name,
      resetUrl,
    })
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      return NextResponse.json({ error: "Password reset email is not configured yet. Please contact support." }, { status: 503 })
    }

    console.error("[auth] Failed to send password reset email", error)
    return NextResponse.json({ error: "We could not send the reset email right now. Please try again shortly." }, { status: 502 })
  }

  return NextResponse.json(process.env.NODE_ENV === "production" ? { success: true } : { success: true, resetUrl })
}
