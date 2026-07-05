import { NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const password = parsed.data.password
  const name = parsed.data.name?.trim() ||
    email.split("@")[0].replace(/[._-]+/g, " ").trim() ||
    "Student"

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.status === "suspended") {
      return NextResponse.json({ error: "Your account is suspended." }, { status: 403 })
    }
    if (existing.status === "banned") {
      return NextResponse.json({ error: "Your account is banned." }, { status: 403 })
    }
    return NextResponse.json({ error: "Email already in use. Please log in." }, { status: 400 })
  }

  const passwordHash = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: "student",
      passwordHash,
    },
  })

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status },
  })

  const maxAge = 60 * 60 * 24 * 30
  res.cookies.set("lms_user_id", user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge })
  res.cookies.set("lms_role", user.role, { httpOnly: true, sameSite: "lax", path: "/", maxAge })

  return res
}
