import { createHash, timingSafeEqual } from "crypto"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"

const PAID_STATUSES = new Set(["paid", "awaiting delivery", "delivered"])
const FAILED_STATUSES = new Set(["cancelled", "canceled", "failed", "error", "expired", "reversed"])

type VerifiedPaynowStatus = {
  reference: string
  amount: number
  providerReference: string | null
  status: "paid" | "pending" | "failed" | "reversed"
}

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right) || left.length !== right.length) return false
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"))
}

function validatePollUrl(value: string) {
  const url = new URL(value)
  const host = url.hostname.toLowerCase()
  if (url.protocol !== "https:" || (host !== "paynow.co.zw" && !host.endsWith(".paynow.co.zw"))) {
    throw new Error("Stored Paynow poll URL is not trusted")
  }
  return url.toString()
}

export async function pollAndVerifyPaynow({
  pollUrl,
  expectedReference,
  expectedAmount,
}: {
  pollUrl: string
  expectedReference: string
  expectedAmount: number
}): Promise<VerifiedPaynowStatus> {
  const testMode = process.env.PAYNOW_TEST_MODE === "mock" && /test/i.test(process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "")
  if (testMode) {
    const url = new URL(pollUrl)
    if (url.hostname !== "mock.paynow.co.zw") throw new Error("Mock Paynow poll URL is not trusted")
    const reference = url.searchParams.get("reference") ?? ""
    const amount = Number(url.searchParams.get("amount"))
    if (reference !== expectedReference || amount !== expectedAmount) throw new Error("Mock Paynow transaction does not match")
    return { reference, amount, providerReference: `MOCK-${reference}`, status: "paid" }
  }
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY?.trim()
  if (!integrationKey) throw new Error("Paynow verification is not configured")

  const response = await fetch(validatePollUrl(pollUrl), {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Paynow verification returned HTTP ${response.status}`)

  const raw = await response.text()
  const params = new URLSearchParams(raw)
  const receivedHash = params.get("hash")?.toUpperCase()
  if (!receivedHash) throw new Error("Paynow verification response has no signature")

  let signedValue = ""
  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() !== "hash") signedValue += value
  }
  const expectedHash = createHash("sha512").update(`${signedValue}${integrationKey.toLowerCase()}`).digest("hex").toUpperCase()
  if (!safeEqualHex(receivedHash, expectedHash)) throw new Error("Paynow verification signature is invalid")

  const reference = params.get("reference") ?? ""
  const amount = Number(params.get("amount"))
  if (reference !== expectedReference) throw new Error("Paynow reference does not match the local transaction")
  if (!Number.isFinite(amount) || Math.abs(amount - expectedAmount) > 0.001) {
    throw new Error("Paynow amount does not match the local transaction")
  }

  const normalized = (params.get("status") ?? "").trim().toLowerCase()
  const status = PAID_STATUSES.has(normalized)
    ? "paid"
    : normalized === "reversed"
      ? "reversed"
      : FAILED_STATUSES.has(normalized)
        ? "failed"
        : "pending"

  return {
    reference,
    amount,
    providerReference: params.get("paynowreference"),
    status,
  }
}

async function getCommissionRateBps(tx: Prisma.TransactionClient) {
  const row = await tx.platformSetting.findUnique({ where: { key: "commissionRateBps" }, select: { value: true } })
  const parsed = row?.value ? Number.parseInt(row.value, 10) : Number.NaN
  return Number.isFinite(parsed) ? Math.max(0, Math.min(10_000, parsed)) : 1500
}

export async function verifyAndFulfillPayment(reference: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { reference },
    select: {
      id: true,
      type: true,
      status: true,
      amount: true,
      currency: true,
      reference: true,
      userId: true,
      courseId: true,
      subjectPackageId: true,
      providerPollUrl: true,
    },
  })
  if (!transaction || !transaction.reference) return { outcome: "unknown" as const }
  const localReference = transaction.reference
  if (transaction.status === "succeeded") return { outcome: "paid" as const }
  if (!transaction.providerPollUrl) throw new Error("Payment has no provider verification URL")

  const verified = await pollAndVerifyPaynow({
    pollUrl: transaction.providerPollUrl,
    expectedReference: transaction.reference,
    expectedAmount: transaction.amount,
  })

  if (verified.status !== "paid") {
    const status = verified.status === "reversed" ? "reversed" : verified.status === "failed" ? "failed" : "pending"
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status, providerReference: verified.providerReference },
    })
    return { outcome: verified.status }
  }

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.transaction.updateMany({
      where: { id: transaction.id, status: { not: "succeeded" } },
      data: { status: "succeeded", providerReference: verified.providerReference, verifiedAt: new Date() },
    })
    if (claimed.count === 0) return { outcome: "paid" as const }

    if (!transaction.userId) throw new Error("Payment has no purchaser")

    if (transaction.courseId) {
      const course = await tx.course.findUnique({
        where: { id: transaction.courseId },
        select: { id: true, title: true, instructorId: true },
      })
      if (!course) throw new Error("Paid course no longer exists")

      const enrollment = await tx.enrollment.upsert({
        where: { userId_courseId: { userId: transaction.userId, courseId: course.id } },
        update: {},
        create: { userId: transaction.userId, courseId: course.id },
        select: { id: true },
      })
      await tx.transaction.update({ where: { id: transaction.id }, data: { enrollmentId: enrollment.id } })

      const commissionRateBps = await getCommissionRateBps(tx)
      const commission = Math.round((transaction.amount * commissionRateBps) / 10_000)
      const payout = Math.max(0, transaction.amount - commission)
      const refBase = enrollment.id.replace(/-/g, "").slice(0, 12).toUpperCase()

      if (commission > 0) {
        await tx.transaction.upsert({
          where: { enrollmentId_type: { enrollmentId: enrollment.id, type: "commission" } },
          update: {},
          create: {
            type: "commission", status: "succeeded", currency: transaction.currency, amount: commission,
            courseId: course.id, enrollmentId: enrollment.id, reference: `COM-${refBase}`,
            description: `Platform commission (${commissionRateBps / 100}%) for ${course.title}`,
          },
        })
      }
      if (payout > 0) {
        await tx.transaction.upsert({
          where: { enrollmentId_type: { enrollmentId: enrollment.id, type: "payout" } },
          update: {},
          create: {
            type: "payout", status: "pending", currency: transaction.currency, amount: payout,
            userId: course.instructorId, courseId: course.id, enrollmentId: enrollment.id,
            reference: `PAY-${refBase}`, description: `Payout due to instructor for ${course.title}`,
          },
        })
      }
    } else if (transaction.subjectPackageId) {
      const pkg = await tx.subjectPackage.findUnique({ where: { id: transaction.subjectPackageId } })
      if (!pkg) throw new Error("Paid subject package no longer exists")
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      await tx.subjectEnrollment.upsert({
        where: { userId_subjectPackageId: { userId: transaction.userId, subjectPackageId: pkg.id } },
        update: { status: "active", grade: pkg.grade, price: transaction.amount, currency: transaction.currency, billingPeriod: pkg.billingPeriod, startDate, endDate },
        create: { userId: transaction.userId, subjectPackageId: pkg.id, status: "active", grade: pkg.grade, price: transaction.amount, currency: transaction.currency, billingPeriod: pkg.billingPeriod, startDate, endDate },
      })
    } else {
      throw new Error("Payment is not associated with a fulfillable item")
    }

    await tx.invoice.upsert({
      where: { userId_reference: { userId: transaction.userId, reference: localReference } },
      update: { status: "paid", paidAt: new Date() },
      create: { userId: transaction.userId, currency: transaction.currency, amount: transaction.amount, status: "paid", reference: localReference, paidAt: new Date() },
    })

    return { outcome: "paid" as const }
  })
}
