import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

async function ensureStudent() {
  const session = await getSession()
  if (!session) return { error: Response.json({ error: "Not logged in" }, { status: 401 }) }
  if (session.role !== "student") return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student") return { error: Response.json({ error: "Invalid session" }, { status: 401 }) }
  if (user.status !== "active") return { error: Response.json({ error: "Account disabled" }, { status: 403 }) }

  return { user }
}

export async function GET() {
  const auth = await ensureStudent()
  if ("error" in auth) return auth.error

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return Response.json({ notifications })
}

const PatchSchema = z.object({
  action: z.enum(["markRead", "markAllRead"]),
  id: z.string().uuid().optional(),
})

export async function PATCH(req: Request) {
  const auth = await ensureStudent()
  if ("error" in auth) return auth.error

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  if (parsed.data.action === "markAllRead") {
    await prisma.notification.updateMany({
      where: { userId: auth.user.id, readAt: null },
      data: { readAt: new Date() },
    })
    return Response.json({ success: true })
  }

  if (!parsed.data.id) return Response.json({ error: "Notification id is required" }, { status: 400 })

  const n = await prisma.notification.findUnique({ where: { id: parsed.data.id }, select: { userId: true } })
  if (!n || n.userId !== auth.user.id) return Response.json({ error: "Not found" }, { status: 404 })

  await prisma.notification.update({ where: { id: parsed.data.id }, data: { readAt: new Date() } })
  return Response.json({ success: true })
}
