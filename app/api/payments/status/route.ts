import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { verifyAndFulfillPayment } from "@/lib/payment-verification"

const QuerySchema = z.object({
  reference: z.string().min(1),
  itemType: z.enum(["course", "training"]).optional(),
  itemId: z.string().min(1).optional(),
})

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }

  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    reference: url.searchParams.get("reference") ?? undefined,
    itemType: url.searchParams.get("itemType") ?? undefined,
    itemId: url.searchParams.get("itemId") ?? undefined,
  })
  if (!parsed.success) {
    return Response.json({ error: "Invalid query" }, { status: 400 })
  }

  let transaction = await prisma.transaction.findUnique({
    where: { reference: parsed.data.reference },
    select: {
      id: true,
      type: true,
      status: true,
      amount: true,
      currency: true,
      description: true,
      reference: true,
      createdAt: true,
      userId: true,
      courseId: true,
      enrollmentId: true,
      subjectPackageId: true,
    },
  })

  if (!transaction) {
    return Response.json({ error: "Payment not found" }, { status: 404 })
  }

  if (session.role !== "admin" && transaction.userId !== session.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  if (transaction.status === "pending") {
    try {
      await verifyAndFulfillPayment(parsed.data.reference)
      transaction = await prisma.transaction.findUnique({
        where: { reference: parsed.data.reference },
        select: { id: true, type: true, status: true, amount: true, currency: true, description: true, reference: true, createdAt: true, userId: true, courseId: true, enrollmentId: true, subjectPackageId: true },
      })
      if (!transaction) return Response.json({ error: "Payment not found" }, { status: 404 })
    } catch (error) {
      console.error(JSON.stringify({ event: "payment_status_verification_failed", reference: parsed.data.reference, message: error instanceof Error ? error.message : "unknown" }))
    }
  }

  if (!transaction) return Response.json({ error: "Payment not found" }, { status: 404 })
  const currentTransaction = transaction

  const itemType = parsed.data.itemType ?? (currentTransaction.courseId ? "course" : "training")
  const itemId = currentTransaction.courseId ?? currentTransaction.subjectPackageId ?? parsed.data.itemId ?? null

  const hasCourseAccess =
    itemType === "course" && currentTransaction.userId && itemId
      ? Boolean(
          await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: currentTransaction.userId, courseId: itemId } },
            select: { id: true },
          })
        )
      : false

  const hasSubjectAccess =
    itemType === "training" && currentTransaction.userId && itemId
      ? Boolean(await prisma.subjectEnrollment.findFirst({ where: { userId: currentTransaction.userId, subjectPackageId: itemId, status: "active", OR: [{ endDate: null }, { endDate: { gt: new Date() } }] }, select: { id: true } }))
      : false

  return Response.json({
    reference: currentTransaction.reference,
    status: currentTransaction.status,
    type: currentTransaction.type,
    amount: currentTransaction.amount,
    currency: currentTransaction.currency,
    description: currentTransaction.description,
    createdAt: currentTransaction.createdAt,
    itemType,
    itemId,
    hasCourseAccess,
    hasSubjectAccess,
  })
}
