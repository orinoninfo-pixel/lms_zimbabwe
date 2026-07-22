import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { CurrencyCode, TransactionStatus, Prisma } from "@/lib/generated/prisma/client"

const CallbackSchema = z.object({
  reference: z.string().min(1).optional(),
  merchantreference: z.string().min(1).optional(),
  merchantReference: z.string().min(1).optional(),
  status: z.string().optional(),
  paid: z.enum(["true", "false", "1", "0"]).optional(),
})

async function parseCallbackPayload(req: Request) {
  const contentType = req.headers.get("content-type")?.toLowerCase() ?? ""

  if (contentType.includes("application/json")) {
    return (await req.json().catch(() => null)) as Record<string, unknown> | null
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null)
    return form ? Object.fromEntries(form.entries()) : null
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("text/plain")
  ) {
    const raw = await req.text().catch(() => "")
    const params = new URLSearchParams(raw)
    return Object.fromEntries(params.entries())
  }

  return (await req.json().catch(() => null)) as Record<string, unknown> | null
}

async function getCommissionRateBps(tx: Prisma.TransactionClient) {
  const row = await tx.platformSetting.findUnique({ where: { key: "commissionRateBps" }, select: { value: true } })
  const parsed = row?.value ? Number.parseInt(row.value, 10) : Number.NaN
  if (!Number.isFinite(parsed)) return 1500
  return Math.max(0, Math.min(10_000, parsed))
}

function getTransactionStatus(payload: { status?: string; paid?: string }): TransactionStatus {
  const normalized = payload.status?.trim().toLowerCase()
  const paid = payload.paid === "true" || payload.paid === "1"

  if (paid || normalized === "paid" || normalized === "succeeded") return "succeeded"
  if (normalized === "reversed") return "reversed"
  if (normalized && ["cancelled", "canceled", "failed", "error", "expired"].includes(normalized)) return "failed"
  return "pending"
}

export async function POST(req: Request) {
  const json = await parseCallbackPayload(req)
  const parsed = CallbackSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid callback payload" }, { status: 400 })
  }

  const reference = parsed.data.reference ?? parsed.data.merchantreference ?? parsed.data.merchantReference
  if (!reference) {
    return Response.json({ error: "Missing reference" }, { status: 400 })
  }

  const status = getTransactionStatus(parsed.data)

  const transaction = await prisma.transaction.findFirst({
    where: { reference },
    select: {
      id: true,
      type: true,
      userId: true,
      courseId: true,
      enrollmentId: true,
      amount: true,
      currency: true,
      reference: true,
    },
  })

  if (!transaction) {
    return Response.json({ success: true, message: "Ignored unknown reference" })
  }

  if (status === "succeeded" && transaction.type === "enrollment" && transaction.courseId && transaction.userId) {
    await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.upsert({
        where: { userId_courseId: { userId: transaction.userId!, courseId: transaction.courseId! } },
        update: {},
        create: { userId: transaction.userId!, courseId: transaction.courseId! },
        select: { id: true },
      })

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status, enrollmentId: enrollment.id },
      })

      const commissionRateBps = await getCommissionRateBps(tx)
      const commission = Math.round((transaction.amount * commissionRateBps) / 10_000)
      const payout = Math.max(0, transaction.amount - commission)
      const refBase = enrollment.id.replace(/-/g, "").slice(0, 12).toUpperCase()

      const [existingCommission, existingPayout, existingInvoice, course] = await Promise.all([
        tx.transaction.findFirst({
          where: { enrollmentId: enrollment.id, type: "commission" },
          select: { id: true },
        }),
        tx.transaction.findFirst({
          where: { enrollmentId: enrollment.id, type: "payout" },
          select: { id: true },
        }),
        transaction.reference
          ? tx.invoice.findFirst({
              where: { userId: transaction.userId!, reference: transaction.reference },
              select: { id: true },
            })
          : null,
        tx.course.findUnique({
          where: { id: transaction.courseId! },
          select: { instructorId: true, title: true },
        }),
      ])

      if (course && commission > 0 && !existingCommission) {
        await tx.transaction.create({
          data: {
            type: "commission",
            status: "succeeded",
            currency: transaction.currency,
            amount: commission,
            courseId: transaction.courseId!,
            enrollmentId: enrollment.id,
            reference: `COM-${refBase}`,
            description: `Platform commission (${commissionRateBps / 100}%) for ${course.title}`,
          },
        })
      }

      if (course && payout > 0 && !existingPayout) {
        await tx.transaction.create({
          data: {
            type: "payout",
            status: "pending",
            currency: transaction.currency,
            amount: payout,
            userId: course.instructorId,
            courseId: transaction.courseId!,
            enrollmentId: enrollment.id,
            reference: `PAY-${refBase}`,
            description: `Payout due to instructor for ${course.title}`,
          },
        })
      }

      if (!existingInvoice) {
        await tx.invoice.create({
          data: {
            userId: transaction.userId!,
            currency: transaction.currency as CurrencyCode,
            amount: transaction.amount,
            status: "paid",
            reference: transaction.reference ?? `INV-${refBase}`,
            paidAt: new Date(),
          },
        })
      }
    })
  } else {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status },
    })
  }

  return Response.json({ success: true })
}
