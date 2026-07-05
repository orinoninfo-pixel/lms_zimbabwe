import { getSession } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }
  if (session.role !== "student") {
    return Response.json({ error: "Only students can enroll" }, { status: 403 })
  }
  await req.text().catch(() => "")
  return Response.json(
    {
      error: "Direct enrollment is disabled. Start a Paynow checkout before accessing paid courses.",
      checkoutRequired: true,
    },
    { status: 400 }
  )
}
