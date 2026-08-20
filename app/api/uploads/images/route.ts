import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { deleteStoredImage, uploadImage } from "@/lib/storage"
import { rateLimit } from "@/lib/rate-limit"

const EntitySchema = z.object({ entityType: z.enum(["course", "tutorial"]), entityId: z.string().uuid() })

async function authorize(entityType: "course" | "tutorial", entityId: string) {
  const auth = await requireRole("admin", "internal_instructor", "instructor")
  if (auth instanceof Response) return { error: auth }
  if (entityType === "tutorial") {
    if (auth.user.role === "instructor") return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }
    const tutorial = await prisma.tutorial.findUnique({ where: { id: entityId }, select: { id: true, imageUrl: true } })
    return tutorial ? { auth, currentUrl: tutorial.imageUrl } : { error: Response.json({ error: "Not found" }, { status: 404 }) }
  }
  const course = await prisma.course.findUnique({ where: { id: entityId }, select: { id: true, instructorId: true, imageUrl: true } })
  if (!course) return { error: Response.json({ error: "Not found" }, { status: 404 }) }
  if (auth.user.role !== "admin" && course.instructorId !== auth.user.id) return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }
  return { auth, currentUrl: course.imageUrl }
}

export async function POST(req: Request) {
  const limited = await rateLimit(req, "image_upload", 20, 60 * 60)
  if (limited) return limited
  const form = await req.formData().catch(() => null)
  const parsed = EntitySchema.safeParse({ entityType: form?.get("entityType"), entityId: form?.get("entityId") })
  const file = form?.get("file")
  if (!parsed.success || !(file instanceof File)) return Response.json({ error: "Invalid upload" }, { status: 400 })
  const access = await authorize(parsed.data.entityType, parsed.data.entityId)
  if ("error" in access) return access.error
  try {
    const uploaded = await uploadImage(file, parsed.data.entityType === "course" ? "courses" : "tutorials", parsed.data.entityId)
    if (parsed.data.entityType === "course") await prisma.course.update({ where: { id: parsed.data.entityId }, data: { imageUrl: uploaded.url } })
    else await prisma.tutorial.update({ where: { id: parsed.data.entityId }, data: { imageUrl: uploaded.url, updatedById: access.auth.user.id } })
    await deleteStoredImage(access.currentUrl).catch((error) => console.error(JSON.stringify({ event: "orphan_image_cleanup_failed", message: error instanceof Error ? error.message : "unknown" })))
    return Response.json({ success: true, imageUrl: uploaded.url })
  } catch (error) {
    console.error(JSON.stringify({ event: "image_upload_failed", entityType: parsed.data.entityType, entityId: parsed.data.entityId, message: error instanceof Error ? error.message : "unknown" }))
    return Response.json({ error: error instanceof Error && error.message.includes("configured") ? "Image storage is not configured" : error instanceof Error ? error.message : "Upload failed" }, { status: error instanceof Error && error.message.includes("configured") ? 503 : 400 })
  }
}

export async function DELETE(req: Request) {
  const parsed = EntitySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 })
  const access = await authorize(parsed.data.entityType, parsed.data.entityId)
  if ("error" in access) return access.error
  if (parsed.data.entityType === "course") await prisma.course.update({ where: { id: parsed.data.entityId }, data: { imageUrl: null } })
  else await prisma.tutorial.update({ where: { id: parsed.data.entityId }, data: { imageUrl: null, updatedById: access.auth.user.id } })
  await deleteStoredImage(access.currentUrl).catch(() => undefined)
  return Response.json({ success: true })
}
