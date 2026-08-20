import { z } from "zod"
import { verifyAndFulfillPayment } from "@/lib/payment-verification"
import { rateLimit } from "@/lib/rate-limit"

const CallbackSchema = z.object({
  reference: z.string().min(1).max(200).optional(),
  merchantreference: z.string().min(1).max(200).optional(),
  merchantReference: z.string().min(1).max(200).optional(),
})

async function parseCallbackPayload(req: Request) {
  const contentType = req.headers.get("content-type")?.toLowerCase() ?? ""
  if (contentType.includes("application/json")) return req.json().catch(() => null)
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null)
    return form ? Object.fromEntries(form.entries()) : null
  }
  const raw = await req.text().catch(() => "")
  return Object.fromEntries(new URLSearchParams(raw).entries())
}

export async function POST(req: Request) {
  const limited = await rateLimit(req, "paynow_callback", 120, 60)
  if (limited) return limited
  const parsed = CallbackSchema.safeParse(await parseCallbackPayload(req))
  if (!parsed.success) return Response.json({ error: "Invalid callback payload" }, { status: 400 })

  const reference = parsed.data.reference ?? parsed.data.merchantreference ?? parsed.data.merchantReference
  if (!reference) return Response.json({ error: "Missing reference" }, { status: 400 })

  try {
    // Callback fields are only a wake-up signal. Fulfillment uses a signed,
    // server-to-server poll response from Paynow and the local authoritative amount.
    const result = await verifyAndFulfillPayment(reference)
    return Response.json({ success: true, outcome: result.outcome })
  } catch (error) {
    console.error(JSON.stringify({ event: "paynow_verification_failed", reference, message: error instanceof Error ? error.message : "unknown" }))
    return Response.json({ success: false, error: "Payment verification failed" }, { status: 502 })
  }
}
