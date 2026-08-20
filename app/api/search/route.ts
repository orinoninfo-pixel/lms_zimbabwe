import { z } from "zod"
import { searchPublishedContent } from "@/lib/search"
import { rateLimit } from "@/lib/rate-limit"

const QuerySchema = z.string().trim().min(2).max(100)
export async function GET(req: Request) {
  const limited = await rateLimit(req, "search", 120, 60)
  if (limited) return limited
  const parsed = QuerySchema.safeParse(new URL(req.url).searchParams.get("q") ?? "")
  if (!parsed.success) return Response.json({ results: [] })
  return Response.json({ results: await searchPublishedContent(parsed.data) }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } })
}
