import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { preparePaynowCheckout } from "@/lib/paynow"

const PrepareSchema = z.object({
  itemType: z.enum(["course", "training"]),
  itemId: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")).transform((value) => (value ? value : undefined)),
})

function buildReference(prefix: string, itemId: string) {
  const short = itemId.replace(/-/g, "").slice(0, 8).toUpperCase()
  return `${prefix}-${short}-${Date.now().toString(36).toUpperCase()}`
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }

  const json = await req.json().catch(() => null)
  const parsed = PrepareSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { itemType, itemId, customerEmail } = parsed.data

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true },
    })

    if (itemType === "course") {
      const course = await prisma.course.findUnique({
        where: { id: itemId },
        select: { id: true, title: true, price: true, status: true },
      })

      if (!course) {
        return Response.json({ error: "Course not found" }, { status: 404 })
      }

      if (course.status !== "approved") {
        return Response.json({ error: "Course is not available for purchase" }, { status: 400 })
      }

      const requiresPayment = course.price > 0
      const reference = buildReference("COURSE", course.id)
      const checkout = await preparePaynowCheckout({
        reference,
        description: `Enrollment for ${course.title}`,
        amount: course.price,
        customerEmail: customerEmail ?? user?.email,
        returnUrl: process.env.PAYNOW_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/billing`,
        resultUrl: process.env.PAYNOW_RESULT_URL || `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/payments/paynow/callback`,
      })

      if (requiresPayment) {
        await prisma.transaction.create({
          data: {
            type: "enrollment",
            status: "pending",
            currency: "USD",
            amount: course.price,
            userId: session.userId,
            courseId: course.id,
            reference: checkout.reference,
            description: checkout.description,
          },
        })
      }

      return Response.json({
        success: true,
        requiresPayment,
        checkout,
        item: { type: "course", id: course.id, title: course.title, price: course.price },
      })
    }

    const pkg = await prisma.subjectPackage.findUnique({
      where: { id: itemId },
      select: { id: true, title: true, price: true, currency: true },
    })

    if (!pkg) {
      return Response.json({ error: "Training package not found" }, { status: 404 })
    }

    const requiresPayment = pkg.price > 0
    const reference = buildReference("TRAIN", pkg.id)
    const checkout = await preparePaynowCheckout({
      reference,
      description: `Training access for ${pkg.title}`,
      amount: pkg.price,
      customerEmail: customerEmail ?? user?.email,
      returnUrl: process.env.PAYNOW_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/billing`,
      resultUrl: process.env.PAYNOW_RESULT_URL || `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/payments/paynow/callback`,
    })

    if (requiresPayment) {
      await prisma.transaction.create({
        data: {
          type: "adjustment",
          status: "pending",
          currency: pkg.currency,
          amount: pkg.price,
          userId: session.userId,
          reference: checkout.reference,
          description: checkout.description,
        },
      })
    }

    return Response.json({
      success: true,
      requiresPayment,
      checkout,
      item: { type: "training", id: pkg.id, title: pkg.title, price: pkg.price },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to prepare payment"
    return Response.json({ error: message }, { status: 500 })
  }
}
