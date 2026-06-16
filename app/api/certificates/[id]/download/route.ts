import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getSession()
  if (!session) return Response.json({ error: "Not logged in" }, { status: 401 })
  if (session.role !== "student") return Response.json({ error: "Forbidden" }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true, name: true },
  })
  if (!user || user.role !== "student") return Response.json({ error: "Invalid session" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Account disabled" }, { status: 403 })

  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { course: { select: { title: true } } },
  })
  if (!cert || cert.userId !== user.id) return Response.json({ error: "Not found" }, { status: 404 })

  const content = [
    "Zim Learning Certificate of Completion",
    "",
    `Certificate ID: ${cert.certificateId}`,
    `Learner: ${user.name}`,
    `Course: ${cert.course.title}`,
    `Completion date: ${cert.issuedAt.toLocaleDateString("en-ZW")}`,
    "",
    "This certificate confirms that the learner has successfully completed the course on Zim Learning.",
  ].join("\n")

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"certificate-${cert.certificateId}.txt\"`,
    },
  })
}
