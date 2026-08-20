import { NextResponse } from "next/server"
import { clearSessionCookies, getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) {
    const response = NextResponse.json({ session: null, user: null })
    clearSessionCookies(response)
    return response
  }

  const user = { id: session.userId, email: session.email, name: session.name, role: session.role, status: "active" }
  return NextResponse.json({ session: { userId: session.userId, role: session.role }, user })
}
