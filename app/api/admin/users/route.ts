import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

const adminUserListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  mustChangePassword: true,
  createdAt: true,
} as any

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const role = url.searchParams.get("role")
  const status = url.searchParams.get("status")
  const q = url.searchParams.get("q")?.trim() ?? ""

  const where: Record<string, unknown> = {}
  if (role && ["student", "instructor", "admin"].includes(role)) where.role = role
  if (status && ["active", "suspended", "banned"].includes(status)) where.status = status
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    select: adminUserListSelect,
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return Response.json({ users })
}

const PatchSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["activate", "suspend", "ban", "setRole"]),
  role: z.enum(["student", "instructor", "admin"]).optional(),
})

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const { userId, action, role } = parsed.data
  if (userId === auth.user.id) {
    return Response.json({ error: "You cannot modify your own account." }, { status: 400 })
  }

  if (action === "setRole") {
    if (!role) return Response.json({ error: "Role is required" }, { status: 400 })
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true, status: true },
    })
    return Response.json({ success: true, user: updated })
  }

  const statusMap = {
    activate: "active",
    suspend: "suspended",
    ban: "banned",
  } as const

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: statusMap[action] },
    select: { id: true, role: true, status: true },
  })

  return Response.json({ success: true, user: updated })
}

const DeleteSchema = z.object({ userId: z.string().uuid() })

export async function DELETE(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = DeleteSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const { userId } = parsed.data
  if (userId === auth.user.id) {
    return Response.json({ error: "You cannot delete your own account." }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: userId } })
  return Response.json({ success: true })
}
