import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "lms-zimbabwe",
    timestamp: new Date().toISOString(),
  })
}
