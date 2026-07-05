import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

const BodySchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
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

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`

  return NextResponse.json({ success: true, resetUrl })
}
