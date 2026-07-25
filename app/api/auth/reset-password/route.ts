import { NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { hashResetToken, isPasswordResetTablesAvailable, validatePasswordPolicy } from "@/lib/password-reset"

const BodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const token = parsed.data.token
  const newPassword = parsed.data.newPassword
  const confirmPassword = parsed.data.confirmPassword

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 })
  }

  const policy = validatePasswordPolicy(newPassword)
  if (!policy.valid) {
    return NextResponse.json({ error: policy.error }, { status: 400 })
  }

  const tokenHash = hashResetToken(token)

  if (!isPasswordResetTablesAvailable()) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    const passwordHash = await hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    })

    return NextResponse.json({ success: true })
  }

  const p = prisma as typeof prisma & {
    passwordResetToken: {
      findUnique: (...args: any[]) => Promise<any>
      update: (...args: any[]) => Promise<any>
      updateMany: (...args: any[]) => Promise<any>
    }
  }

  const tokenRecord = await p.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!tokenRecord) {
    return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
  }

  if (tokenRecord.usedAt || tokenRecord.invalidatedAt) {
    return NextResponse.json({ error: "This reset link has already been used. Please request a new link." }, { status: 400 })
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    await p.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { invalidatedAt: new Date() },
    }).catch(() => null)

    return NextResponse.json({ error: "This reset link has expired. Please request a new link." }, { status: 400 })
  }

  const passwordHash = await hash(newPassword, 10)
  const now = new Date()

  const consumed = await prisma.$transaction(async (tx) => {
    const txAny = tx as typeof tx & {
      passwordResetToken: {
        updateMany: (...args: any[]) => Promise<any>
      }
    }

    const consumeResult = await txAny.passwordResetToken.updateMany({
      where: {
        id: tokenRecord.id,
        usedAt: null,
        invalidatedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    })

    if (consumeResult.count !== 1) {
      return false
    }

    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: {
        passwordHash,
        mustChangePassword: false,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    })

    await txAny.passwordResetToken.updateMany({
      where: {
        userId: tokenRecord.userId,
        id: { not: tokenRecord.id },
        usedAt: null,
        invalidatedAt: null,
      },
      data: { invalidatedAt: now },
    })

    return true
  })

  if (!consumed) {
    return NextResponse.json({ error: "This reset link has already been used. Please request a new link." }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
