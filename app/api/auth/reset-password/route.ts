import { NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

const BodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const token = parsed.data.token
  const password = parsed.data.password

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
  }

  const passwordHash = await hash(password, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  })

  const res = NextResponse.json({ success: true })
  const maxAge = 60 * 60 * 24 * 30
  res.cookies.set("lms_user_id", user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge })
  res.cookies.set("lms_role", user.role, { httpOnly: true, sameSite: "lax", path: "/", maxAge })

  return res
}
