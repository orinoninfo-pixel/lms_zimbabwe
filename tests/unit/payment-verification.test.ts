import test from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"

async function verifier() {
  process.env.DATABASE_URL ||= "postgresql://unit:unit@localhost/unit_test?sslmode=disable"
  return import("../../lib/payment-verification")
}

function signedResponse(values: Array<[string, string]>, key: string) {
  const params = new URLSearchParams(values)
  const signed = values.map(([, value]) => value).join("")
  params.set("hash", createHash("sha512").update(`${signed}${key.toLowerCase()}`).digest("hex").toUpperCase())
  return params.toString()
}

test("Paynow poll verification requires a valid signature, reference, and amount", async (context) => {
  const key = "unit-test-paynow-key"
  process.env.PAYNOW_INTEGRATION_KEY = key
  const originalFetch = globalThis.fetch
  context.after(() => { globalThis.fetch = originalFetch })
  globalThis.fetch = async () => new Response(signedResponse([["reference", "COURSE-123"], ["amount", "25"], ["paynowreference", "P-1"], ["status", "Paid"]], key), { status: 200 })
  const { pollAndVerifyPaynow } = await verifier()
  const result = await pollAndVerifyPaynow({ pollUrl: "https://www.paynow.co.zw/interface/poll/abc", expectedReference: "COURSE-123", expectedAmount: 25 })
  assert.equal(result.status, "paid")
  assert.equal(result.providerReference, "P-1")
})

test("Paynow poll verification rejects amount manipulation", async (context) => {
  const key = "unit-test-paynow-key"
  process.env.PAYNOW_INTEGRATION_KEY = key
  const originalFetch = globalThis.fetch
  context.after(() => { globalThis.fetch = originalFetch })
  globalThis.fetch = async () => new Response(signedResponse([["reference", "COURSE-123"], ["amount", "1"], ["status", "Paid"]], key), { status: 200 })
  const { pollAndVerifyPaynow } = await verifier()
  await assert.rejects(pollAndVerifyPaynow({ pollUrl: "https://paynow.co.zw/poll/abc", expectedReference: "COURSE-123", expectedAmount: 25 }), /amount/)
})

test("Paynow poll verification blocks untrusted poll hosts", async () => {
  const { pollAndVerifyPaynow } = await verifier()
  await assert.rejects(pollAndVerifyPaynow({ pollUrl: "https://example.com/poll", expectedReference: "X", expectedAmount: 1 }), /not trusted/)
})
