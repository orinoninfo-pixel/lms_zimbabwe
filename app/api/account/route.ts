import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const PatchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
})

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "student") return Response.json({ error: "Forbidden" }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.role !== "student") return Response.json({ error: "Invalid session" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Account disabled" }, { status: 403 })

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name ? parsed.data.name.trim() : undefined,
    },
    select: { id: true, name: true, email: true, role: true, status: true },
  })

  return Response.json({ success: true, user: updated })
}
