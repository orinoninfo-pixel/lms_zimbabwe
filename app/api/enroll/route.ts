import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const EnrollBodySchema = z.object({
  courseId: z.string().min(1),
})

async function getCommissionRateBps() {
  const row = await prisma.platformSetting.findUnique({ where: { key: "commissionRateBps" }, select: { value: true } })
  const parsed = row?.value ? Number.parseInt(row.value, 10) : Number.NaN
  if (!Number.isFinite(parsed)) return 1500
  return Math.max(0, Math.min(10_000, parsed))
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }
  if (session.role !== "student") {
    return Response.json({ error: "Only students can enroll" }, { status: 403 })
  }

  const json = await req.json().catch(() => null)
  const parsed = EnrollBodySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const userId = session.userId
  const courseId = parsed.data.courseId

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    })
    if (!user || user.role !== "student") {
      return Response.json({ error: "Invalid session" }, { status: 401 })
    }
    if (user.status !== "active") {
      return Response.json({ error: "Account disabled" }, { status: 403 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, price: true, status: true, instructorId: true, title: true },
    })
    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 })
    }
    if (course.status !== "approved") {
      return Response.json({ error: "Course is not available for enrollment" }, { status: 400 })
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    })
    if (existing) {
      return Response.json({ success: true, enrollment: existing })
    }

    const commissionRateBps = await getCommissionRateBps()
    const commission = Math.round((course.price * commissionRateBps) / 10_000)
    const payout = Math.max(0, course.price - commission)

    const enrollment = await prisma.$transaction(async (tx) => {
      const createdEnrollment = await tx.enrollment.create({ data: { userId, courseId } })
      const refBase = createdEnrollment.id.replace(/-/g, "").slice(0, 12).toUpperCase()

      await tx.transaction.create({
        data: {
          type: "enrollment",
          status: "succeeded",
          currency: "USD",
          amount: course.price,
          userId,
          courseId,
          enrollmentId: createdEnrollment.id,
          reference: `ENR-${refBase}`,
          description: `Enrollment payment for ${course.title}`,
        },
      })

      if (commission > 0) {
        await tx.transaction.create({
          data: {
            type: "commission",
            status: "succeeded",
            currency: "USD",
            amount: commission,
            courseId,
            enrollmentId: createdEnrollment.id,
            reference: `COM-${refBase}`,
            description: `Platform commission (${commissionRateBps / 100}%) for ${course.title}`,
          },
        })
      }

      if (payout > 0) {
        await tx.transaction.create({
          data: {
            type: "payout",
            status: "pending",
            currency: "USD",
            amount: payout,
            userId: course.instructorId,
            courseId,
            enrollmentId: createdEnrollment.id,
            reference: `PAY-${refBase}`,
            description: `Payout due to instructor for ${course.title}`,
          },
        })
      }

      return createdEnrollment
    })

    return Response.json({ success: true, enrollment })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to enroll"
    return Response.json({ error: message }, { status: 500 })
  }
}
