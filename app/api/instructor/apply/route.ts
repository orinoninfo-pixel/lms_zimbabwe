import { z } from "zod"
import { prisma } from "@/lib/prisma"

const MAX_RESUME_BYTES = 5 * 1024 * 1024
const allowedResumeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

const ApplySchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phoneNumber: z.string().min(7).max(30),
  linkedinProfile: z.string().url().max(300),
  areaOfExpertise: z.string().min(2).max(120),
  yearsOfExperience: z.coerce.number().int().min(0).max(60),
  professionalCertifications: z.string().max(500).optional(),
  biography: z.string().min(50).max(2000),
  sampleCourseProposal: z.string().min(50).max(3000),
  preferredCourseCategories: z.array(z.string().min(1).max(80)).min(1).max(12),
})

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  if (!form) return Response.json({ error: "Invalid form submission" }, { status: 400 })

  const raw = {
    fullName: String(form.get("fullName") ?? ""),
    email: String(form.get("email") ?? ""),
    phoneNumber: String(form.get("phoneNumber") ?? ""),
    linkedinProfile: String(form.get("linkedinProfile") ?? ""),
    areaOfExpertise: String(form.get("areaOfExpertise") ?? ""),
    yearsOfExperience: String(form.get("yearsOfExperience") ?? ""),
    professionalCertifications: String(form.get("professionalCertifications") ?? "").trim() || undefined,
    biography: String(form.get("biography") ?? ""),
    sampleCourseProposal: String(form.get("sampleCourseProposal") ?? ""),
    preferredCourseCategories: form.getAll("preferredCourseCategories").map((v) => String(v)),
  }

  const parsed = ApplySchema.safeParse(raw)
  if (!parsed.success) {
    return Response.json({ error: "Please check the form fields and try again." }, { status: 400 })
  }

  const resume = form.get("resume") as File | null
  if (!resume) {
    return Response.json({ error: "CV/Resume is required." }, { status: 400 })
  }
  if (!allowedResumeTypes.has(resume.type)) {
    return Response.json({ error: "Resume must be a PDF, DOC, or DOCX file." }, { status: 400 })
  }
  if (resume.size <= 0 || resume.size > MAX_RESUME_BYTES) {
    return Response.json({ error: "Resume file must be 5MB or less." }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true, status: true } })
  if (existingUser?.status === "suspended") return Response.json({ error: "This account is suspended." }, { status: 403 })
  if (existingUser?.status === "banned") return Response.json({ error: "This account is banned." }, { status: 403 })
  if (existingUser?.role === "admin") return Response.json({ error: "Admin accounts cannot apply here." }, { status: 403 })
  if (existingUser?.role === "instructor") return Response.json({ error: "You are already an instructor." }, { status: 400 })

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: { name: parsed.data.fullName.trim() },
        select: { id: true, name: true, email: true, role: true },
      })
    : await prisma.user.create({
        data: { name: parsed.data.fullName.trim(), email, role: "student" },
        select: { id: true, name: true, email: true, role: true },
      })

  const current = await prisma.instructorApplication.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  })
  if (current?.status === "approved") {
    return Response.json({ error: "You are already approved as an instructor." }, { status: 400 })
  }

  const resumeBytes = Buffer.from(await resume.arrayBuffer())

  await prisma.instructorApplication.upsert({
    where: { userId: user.id },
    update: {
      status: "pending",
      reviewedAt: null,
      reviewerId: null,
      notes: null,
      phone: parsed.data.phoneNumber.trim(),
      linkedinUrl: parsed.data.linkedinProfile.trim(),
      expertise: parsed.data.areaOfExpertise.trim(),
      yearsExperience: parsed.data.yearsOfExperience,
      certifications: parsed.data.professionalCertifications ?? null,
      biography: parsed.data.biography.trim(),
      sampleCourseProposal: parsed.data.sampleCourseProposal.trim(),
      preferredCategorySlugs: parsed.data.preferredCourseCategories,
      resumeFileName: resume.name,
      resumeFileType: resume.type,
      resumeFileSize: resume.size,
      resumeData: resumeBytes,
    },
    create: {
      userId: user.id,
      status: "pending",
      phone: parsed.data.phoneNumber.trim(),
      linkedinUrl: parsed.data.linkedinProfile.trim(),
      expertise: parsed.data.areaOfExpertise.trim(),
      yearsExperience: parsed.data.yearsOfExperience,
      certifications: parsed.data.professionalCertifications ?? null,
      biography: parsed.data.biography.trim(),
      sampleCourseProposal: parsed.data.sampleCourseProposal.trim(),
      preferredCategorySlugs: parsed.data.preferredCourseCategories,
      resumeFileName: resume.name,
      resumeFileType: resume.type,
      resumeFileSize: resume.size,
      resumeData: resumeBytes,
    },
  })

  return Response.json({ success: true })
}
