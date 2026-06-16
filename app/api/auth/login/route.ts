import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const BodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["student", "instructor", "admin"]).optional(),
  name: z.string().min(1).optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const desiredRole = parsed.data.role ?? "student"
  const name =
    parsed.data.name ??
    (email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .trim() || "Student")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.status === "suspended") {
      return NextResponse.json({ error: "Your account is suspended." }, { status: 403 })
    }
    if (existing.status === "banned") {
      return NextResponse.json({ error: "Your account is banned." }, { status: 403 })
    }
  }

  if (!existing) {
    if (desiredRole === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be created here." }, { status: 403 })
    }
  }

  const user = existing
    ? existing
    : desiredRole === "instructor"
      ? await prisma.user.create({ data: { email, name, role: "student" } })
      : await prisma.user.create({ data: { email, name, role: "student" } })

  let instructorApplicationStatus: string | null = null
  if (desiredRole === "instructor" && user.role !== "instructor") {
    const application = await prisma.instructorApplication.upsert({
      where: { userId: user.id },
      update: { status: "pending", reviewedAt: null, reviewerId: null, notes: null },
      create: { userId: user.id, status: "pending" },
      select: { status: true },
    })
    instructorApplicationStatus = application.status
  }

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status },
    instructorApplicationStatus,
  })

  const maxAge = 60 * 60 * 24 * 30
  res.cookies.set("lms_user_id", user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge })
  res.cookies.set("lms_role", user.role, { httpOnly: true, sameSite: "lax", path: "/", maxAge })

  return res
}
