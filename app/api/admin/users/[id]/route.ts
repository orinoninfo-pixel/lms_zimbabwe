import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

const userDetailSelect = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
  role: true,
  status: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
  instructorApplication: {
    select: {
      id: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
    },
  },
  courses: {
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true,
      price: true,
      createdAt: true,
    },
  },
  enrollments: {
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
        },
      },
    },
  },
  _count: {
    select: {
      courses: true,
      enrollments: true,
      reportsMade: true,
      reportsAgainst: true,
      certificates: true,
    },
  },
}

function toResponseUser(
  user: Awaited<ReturnType<typeof prisma.user.findUnique>>
) {
  if (!user) return null

  const { passwordHash, ...rest } = user
  return {
    ...rest,
    hasPassword: Boolean(passwordHash),
  }
}

function generateTemporaryPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const symbols = "!@#$%^&*"
  const alphabet = upper + lower + digits + symbols

  const required = [
    upper[randomIndex(upper.length)],
    lower[randomIndex(lower.length)],
    digits[randomIndex(digits.length)],
    symbols[randomIndex(symbols.length)],
  ]

  while (required.length < 12) {
    required.push(alphabet[randomIndex(alphabet.length)])
  }

  for (let i = required.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1)
    ;[required[i], required[j]] = [required[j], required[i]]
  }

  return required.join("")
}

function randomIndex(max: number) {
  return randomBytes(1)[0] % max
}

const UpdateSchema = z
  .object({
    role: z.enum(["student", "instructor", "admin"]).optional(),
    status: z.enum(["active", "suspended", "banned"]).optional(),
    action: z.enum(["resetPassword"]).optional(),
  })
  .refine((data) => data.action === "resetPassword" || data.role !== undefined || data.status !== undefined, {
    message: "Provide at least one change.",
  })

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const { id } = await context.params

  const user = await prisma.user.findUnique({
    where: { id },
    select: userDetailSelect,
  })

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  return Response.json({ user: toResponseUser(user) })
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const { id } = await context.params
  if (id === auth.user.id) {
    return Response.json({ error: "You cannot modify your own account from this screen." }, { status: 400 })
  }

  const json = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!existingUser) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  if (parsed.data.action === "resetPassword") {
    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await hash(temporaryPassword, 10)

    const user = await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
      select: userDetailSelect,
    })

    return Response.json({
      success: true,
      user: toResponseUser(user),
      temporaryPassword,
    })
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
    select: userDetailSelect,
  })

  return Response.json({
    success: true,
    user: toResponseUser(user),
  })
}
