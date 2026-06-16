import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const status = url.searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (status && ["pending", "approved", "rejected"].includes(status)) where.status = status

  const applications = await prisma.instructorApplication.findMany({
    where,
    select: {
      id: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      notes: true,
      phone: true,
      linkedinUrl: true,
      expertise: true,
      yearsExperience: true,
      certifications: true,
      biography: true,
      sampleCourseProposal: true,
      preferredCategorySlugs: true,
      resumeFileName: true,
      user: { select: { id: true, name: true, email: true, role: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return Response.json({ applications })
}

const PatchSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional(),
})

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: "Invalid request body" }, { status: 400 })

  const { applicationId, action, notes } = parsed.data

  const app = await prisma.instructorApplication.findUnique({
    where: { id: applicationId },
    include: { user: { select: { id: true, role: true, status: true } } },
  })
  if (!app) return Response.json({ error: "Application not found" }, { status: 404 })
  if (app.user.status !== "active") return Response.json({ error: "User is not active" }, { status: 400 })
  if (app.status !== "pending") return Response.json({ error: "Application already processed" }, { status: 400 })

  if (action === "approve") {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: app.userId }, data: { role: "instructor" } })
      return tx.instructorApplication.update({
        where: { id: app.id },
        data: { status: "approved", reviewedAt: new Date(), reviewerId: auth.user.id, notes: notes ?? null },
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      })
    })
    return Response.json({ success: true, application: updated })
  }

  const updated = await prisma.instructorApplication.update({
    where: { id: app.id },
    data: { status: "rejected", reviewedAt: new Date(), reviewerId: auth.user.id, notes: notes ?? null },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  })
  return Response.json({ success: true, application: updated })
}
