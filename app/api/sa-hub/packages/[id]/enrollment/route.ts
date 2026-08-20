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

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await ensureStudent()
  if ("error" in auth) return auth.error

  const { id } = await context.params
  const enrollment = await prisma.subjectEnrollment.findUnique({
    where: { userId_subjectPackageId: { userId: auth.user.id, subjectPackageId: id } },
    select: { id: true, status: true, startDate: true, endDate: true, price: true, billingPeriod: true },
  })

  return Response.json({ enrollment })
}

const PostSchema = z.object({
  action: z.literal("cancel"),
})

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await ensureStudent()
  if ("error" in auth) return auth.error

  const { id } = await context.params
  const pkg = await prisma.subjectPackage.findUnique({ where: { id }, select: { id: true, grade: true, price: true, currency: true, billingPeriod: true } })
  if (!pkg) return Response.json({ error: "Not found" }, { status: 404 })

  const json = await req.json().catch(() => null)
  const parsed = PostSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  if (parsed.data.action === "cancel") {
    const enrollment = await prisma.subjectEnrollment.upsert({
      where: { userId_subjectPackageId: { userId: auth.user.id, subjectPackageId: id } },
      update: { status: "cancelled" },
      create: {
        userId: auth.user.id,
        subjectPackageId: id,
        status: "cancelled",
        grade: pkg.grade,
        price: pkg.price,
        currency: pkg.currency,
        billingPeriod: pkg.billingPeriod,
      },
      select: { id: true, status: true, startDate: true, endDate: true, price: true, billingPeriod: true },
    })
    return Response.json({ success: true, enrollment })
  }

  return Response.json({ error: "Paid access can only be activated by verified payment" }, { status: 403 })
}
