import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { CurrencyCode } from "@/lib/generated/prisma/enums"

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const type = url.searchParams.get("type")
  const status = url.searchParams.get("status")
  const q = url.searchParams.get("q")?.trim() ?? ""
  const userId = url.searchParams.get("userId")
  const courseId = url.searchParams.get("courseId")

  const where: Record<string, unknown> = {}
  if (type && ["enrollment", "payout", "commission", "refund", "adjustment"].includes(type)) where.type = type
  if (status && ["pending", "succeeded", "failed", "reversed"].includes(status)) where.status = status
  if (userId) where.userId = userId
  if (courseId) where.courseId = courseId
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { course: { title: { contains: q, mode: "insensitive" } } },
    ]
  }

  const [transactions, revenueAgg, payoutAgg, commissionAgg] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.transaction.aggregate({
      where: { status: "succeeded", currency: CurrencyCode.USD, type: "enrollment" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "succeeded", currency: CurrencyCode.USD, type: "payout" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "succeeded", currency: CurrencyCode.USD, type: "commission" },
      _sum: { amount: true },
    }),
  ])

  return Response.json({
    transactions,
    totals: {
      revenueUsd: revenueAgg._sum?.amount ?? 0,
      payoutsUsd: payoutAgg._sum?.amount ?? 0,
      commissionsUsd: commissionAgg._sum?.amount ?? 0,
    },
  })
}

const CreateSchema = z.object({
  type: z.enum(["enrollment", "payout", "commission", "refund", "adjustment"]),
  status: z.enum(["pending", "succeeded", "failed", "reversed"]).optional(),
  currency: z.enum(["USD", "ZWL", "ZAR"]).optional(),
  amount: z.number().int().positive().max(1_000_000_000),
  userId: z.string().uuid().nullable().optional(),
  courseId: z.string().uuid().nullable().optional(),
  reference: z.string().max(80).optional(),
  description: z.string().max(300).optional(),
})

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const created = await prisma.transaction.create({
    data: {
      type: parsed.data.type,
      status: parsed.data.status ?? "succeeded",
      currency: (parsed.data.currency ?? CurrencyCode.USD) as (typeof CurrencyCode)[keyof typeof CurrencyCode],
      amount: parsed.data.amount,
      userId: parsed.data.userId ?? null,
      courseId: parsed.data.courseId ?? null,
      reference: parsed.data.reference ?? null,
      description: parsed.data.description ?? null,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      course: { select: { id: true, title: true } },
    },
  })

  return Response.json({ success: true, transaction: created })
}

const PatchSchema = z.object({
  transactionId: z.string().uuid(),
  action: z.enum(["setStatus", "updateMeta"]),
  status: z.enum(["pending", "succeeded", "failed", "reversed"]).optional(),
  reference: z.string().max(80).nullable().optional(),
  description: z.string().max(300).nullable().optional(),
})

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const { transactionId, action, status, reference, description } = parsed.data

  if (action === "setStatus") {
    if (!status) return Response.json({ error: "Status is required" }, { status: 400 })
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    })
    return Response.json({ success: true, transaction: updated })
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      reference: reference === undefined ? undefined : reference,
      description: description === undefined ? undefined : description,
    },
  })
  return Response.json({ success: true, transaction: updated })
}
