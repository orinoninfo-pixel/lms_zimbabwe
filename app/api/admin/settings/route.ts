import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const settings = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } })
  return Response.json({ settings })
}

const SettingSchema = z.object({
  key: z.string().min(1).max(80),
  value: z.string().max(10_000),
})

const PatchSchema = z.union([SettingSchema, z.object({ settings: z.array(SettingSchema).min(1).max(50) })])

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const items = "settings" in parsed.data ? parsed.data.settings : [parsed.data]

  const updated = await prisma.$transaction(async (tx) => {
    const rows = []
    for (const item of items) {
      const row = await tx.platformSetting.upsert({
        where: { key: item.key },
        update: { value: item.value, updatedAt: new Date() },
        create: { key: item.key, value: item.value },
      })
      rows.push(row)
    }
    return rows
  })

  return Response.json({ success: true, settings: updated })
}
