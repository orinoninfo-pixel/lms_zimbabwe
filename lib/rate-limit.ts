import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

function clientIp(req: Request) { return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip")?.trim() || "unknown" }

function requestKeyHash(req: Request, identifier = "") {
  return createHash("sha256").update(`${clientIp(req)}:${identifier.trim().toLowerCase()}`).digest("hex")
}

export async function rateLimit(req: Request, action: string, limit: number, windowSeconds: number, identifier = "") {
  const keyHash = requestKeyHash(req, identifier)
  const since = new Date(Date.now() - windowSeconds * 1000)
  const count = await prisma.rateLimitEvent.count({ where: { action, keyHash, createdAt: { gte: since } } })
  if (count >= limit) {
    console.warn(JSON.stringify({ event: "rate_limit_exceeded", action, keyHash: keyHash.slice(0, 12) }))
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(windowSeconds) } })
  }
  await prisma.rateLimitEvent.create({ data: { action, keyHash } })
  return null
}

export async function clearRateLimit(req: Request, action: string, identifier = "") {
  await prisma.rateLimitEvent.deleteMany({ where: { action, keyHash: requestKeyHash(req, identifier) } })
}
