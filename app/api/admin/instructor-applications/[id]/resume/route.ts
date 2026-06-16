import { requireAdmin } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof Response) return auth

  const { id } = await params

  const app = await prisma.instructorApplication.findUnique({
    where: { id },
    select: { resumeData: true, resumeFileName: true, resumeFileType: true },
  })
  if (!app) return Response.json({ error: "Application not found" }, { status: 404 })
  if (!app.resumeData) return Response.json({ error: "No resume uploaded" }, { status: 404 })

  const contentType = app.resumeFileType ?? "application/octet-stream"
  const fileName = app.resumeFileName ?? "resume"

  return new Response(app.resumeData, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName.replaceAll('"', "")}"`,
    },
  })
}

