import { NextResponse } from "next/server"
import { clearSessionCookies, revokeCurrentSession } from "@/lib/auth"

export async function POST() {
  await revokeCurrentSession()
  const res = NextResponse.json({ success: true })
  clearSessionCookies(res)
  return res
}

