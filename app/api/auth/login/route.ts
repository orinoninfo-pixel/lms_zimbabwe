import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createPasswordResetTokenForUser } from "@/lib/password-reset"

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const password = parsed.data.password

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "No account found with that email." }, { status: 404 })
  }
  const userWithPasswordPolicy = user as typeof user & { mustChangePassword?: boolean | null }

  if (user.status === "suspended") {
    return NextResponse.json({ error: "Your account is suspended." }, { status: 403 })
  }
  if (user.status === "banned") {
    return NextResponse.json({ error: "Your account is banned." }, { status: 403 })
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "This account does not support password login. Please reset your password." }, { status: 403 })
  }

  const isValidPassword = await import("bcryptjs").then((bcrypt) => bcrypt.compare(password, user.passwordHash!))
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
  }

  if (userWithPasswordPolicy.mustChangePassword) {
    const { rawToken } = await createPasswordResetTokenForUser(user.id)

    return NextResponse.json(
      {
        requiresPasswordChange: true,
        resetToken: rawToken,
        user: { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status },
      },
      { status: 403 }
    )
  }

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status },
  })

  const maxAge = 60 * 60 * 24 * 30
  res.cookies.set("lms_user_id", user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge })
  res.cookies.set("lms_role", user.role, { httpOnly: true, sameSite: "lax", path: "/", maxAge })

  return res
}
