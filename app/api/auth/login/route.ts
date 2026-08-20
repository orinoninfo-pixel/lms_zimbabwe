import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createPasswordResetTokenForUser } from "@/lib/password-reset"
import { createSession, setSessionCookie } from "@/lib/auth"
import { clearRateLimit, rateLimit } from "@/lib/rate-limit"

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
  const limited = await rateLimit(req, "login", 10, 15 * 60, email)
  if (limited) return limited

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    await import("bcryptjs").then((bcrypt) => bcrypt.compare(password, "$2b$10$C6UzMDM.H6dfI/f/IKcEe.7XSs6X5.Oj1xGiK1t1u0VYJxK8QxG1a"))
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
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

  // Successful authentication proves this is not an active brute-force
  // sequence. Keep failed attempts limited without penalising normal users who
  // sign in repeatedly across devices or test sessions.
  await clearRateLimit(req, "login", email)

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

  const session = await createSession(user.id, req)
  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status },
  })

  setSessionCookie(res, session.token)

  return res
}
