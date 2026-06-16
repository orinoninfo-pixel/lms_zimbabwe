import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ session: null, user: null })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, status: true },
  })

  if (!user || user.status !== "active" || user.role !== session.role) {
    const res = NextResponse.json({ session: null, user: null })
    res.cookies.set("lms_user_id", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
    res.cookies.set("lms_role", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
    return res
  }

  return NextResponse.json({ session, user })
}
