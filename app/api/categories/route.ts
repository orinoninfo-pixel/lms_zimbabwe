import { prisma } from "@/lib/prisma"

export async function GET() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
    take: 200,
  })

  return Response.json(
    { categories },
    {
      // Categories change rarely — cache an hour at the edge, serve stale
      // for up to a day while revalidating in the background.
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    }
  )
}
