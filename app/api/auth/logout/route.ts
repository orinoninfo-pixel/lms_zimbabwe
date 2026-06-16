import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set("lms_user_id", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
  res.cookies.set("lms_role", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
  return res
}

