import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

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

  const transaction = await prisma.transaction.findFirst({
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
    },
  })

  if (!transaction) {
    return Response.json({ error: "Payment not found" }, { status: 404 })
  }

  if (session.role !== "admin" && transaction.userId !== session.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const itemType = parsed.data.itemType ?? (transaction.courseId ? "course" : "training")
  const itemId = transaction.courseId ?? parsed.data.itemId ?? null

  const hasCourseAccess =
    itemType === "course" && transaction.userId && itemId
      ? Boolean(
          await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: transaction.userId, courseId: itemId } },
            select: { id: true },
          })
        )
      : false

  return Response.json({
    reference: transaction.reference,
    status: transaction.status,
    type: transaction.type,
    amount: transaction.amount,
    currency: transaction.currency,
    description: transaction.description,
    createdAt: transaction.createdAt,
    itemType,
    itemId,
    hasCourseAccess,
  })
}
