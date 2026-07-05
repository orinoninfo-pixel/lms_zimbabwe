import { z } from "zod"
import { prisma } from "@/lib/prisma"

const CallbackSchema = z.object({
  reference: z.string().min(1).optional(),
  status: z.string().optional(),
  paid: z.enum(["true", "false", "1", "0"]).optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = CallbackSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid callback payload" }, { status: 400 })
  }

  const reference = parsed.data.reference
  if (!reference) {
    return Response.json({ error: "Missing reference" }, { status: 400 })
  }

  const paid = parsed.data.paid === "true" || parsed.data.paid === "1"
  const status = paid ? "succeeded" : parsed.data.status === "paid" ? "succeeded" : "failed"

  const transaction = await prisma.transaction.findFirst({
    where: { reference },
    select: { id: true, userId: true, courseId: true, enrollmentId: true },
  })

  if (!transaction) {
    return Response.json({ success: true, message: "Ignored unknown reference" })
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status },
  })

  if (status === "succeeded" && transaction.courseId && transaction.userId) {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: transaction.userId, courseId: transaction.courseId } },
      select: { id: true },
    })

    if (!existing) {
      await prisma.enrollment.create({
        data: { userId: transaction.userId, courseId: transaction.courseId },
      })
    }
  }

  return Response.json({ success: true })
}
