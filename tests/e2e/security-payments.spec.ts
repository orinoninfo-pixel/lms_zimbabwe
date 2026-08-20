import { test, expect } from "@playwright/test"
import { loginAs } from "./utils/auth"

async function api<T>(page: import("@playwright/test").Page, path: string, init?: RequestInit) {
  return page.evaluate(async ({ path, init }) => { const response = await fetch(path, init); return { status: response.status, json: await response.json().catch(() => null) } }, { path, init }) as Promise<{ status: number; json: T }>
}

test.describe("Secure sessions and RBAC", () => {
  test("a forged legacy identity cookie grants no access", async ({ page, context }) => {
    await context.addCookies([{ name: "lms_user_id", value: "11111111-1111-4111-8111-111111111111", domain: "localhost", path: "/" }, { name: "lms_role", value: "admin", domain: "localhost", path: "/" }])
    await page.goto("/admin")
    await expect(page).not.toHaveURL(/\/admin/)
    const response = await api(page, "/api/admin/stats")
    expect(response.status).toBe(401)
  })

  test("student sessions cannot call admin or instructor APIs", async ({ page }) => {
    await loginAs(page, "student")
    expect((await api(page, "/api/admin/stats")).status).toBe(403)
    expect((await api(page, "/api/instructor/stats")).status).toBe(403)
  })

  test("anonymous image upload is rejected", async ({ page }) => {
    await page.goto("/")
    const result = await page.evaluate(async () => { const form = new FormData(); form.set("entityType", "course"); form.set("entityId", "11111111-1111-4111-8111-111111111111"); form.set("file", new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "x.png", { type: "image/png" })); const response = await fetch("/api/uploads/images", { method: "POST", body: form }); return response.status })
    expect(result).toBe(401)
  })
})

test.describe("Free and mocked paid fulfillment", () => {
  test.beforeEach(async ({ page }) => { await loginAs(page, "student") })

  test("free marketplace course enrolls once without Paynow", async ({ page }) => {
    const courses = await api<Array<{ id: string; title: string }>>(page, "/api/courses")
    const course = courses.json.find((item) => item.title === "E2E Fixture: Free Course")!
    const first = await api<{ enrolledFree?: boolean; alreadyEnrolled?: boolean; checkout?: unknown }>(page, "/api/checkout/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemType: "course", itemId: course.id }) })
    expect(first.status).toBe(200)
    expect(first.json.checkout).toBeUndefined()
    expect(first.json.enrolledFree || first.json.alreadyEnrolled).toBeTruthy()
    const second = await api<{ alreadyEnrolled: boolean }>(page, "/api/checkout/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemType: "course", itemId: course.id }) })
    expect(second.json.alreadyEnrolled).toBe(true)
  })

  test("mocked paid course verifies and fulfills idempotently", async ({ page }) => {
    const courses = await api<Array<{ id: string; title: string }>>(page, "/api/courses")
    const course = courses.json.find((item) => item.title === "E2E Fixture: Paid Course")!
    const checkout = await api<{ checkout: { reference: string }; item: { price: number } }>(page, "/api/checkout/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemType: "course", itemId: course.id }) })
    expect(checkout.json.item.price).toBe(12)
    const callback = () => api<{ outcome: string }>(page, "/api/payments/paynow/callback", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ reference: checkout.json.checkout.reference }).toString() })
    expect((await callback()).json.outcome).toBe("paid")
    expect((await callback()).json.outcome).toBe("paid")
    const mine = await api<{ courses: Array<{ id: string }> }>(page, "/api/my-courses")
    expect(mine.json.courses.filter((item) => item.id === course.id)).toHaveLength(1)
  })

  test("free and paid subject packages enforce entitlement rules", async ({ page }) => {
    const packages = await api<{ packages: Array<{ id: string; title: string }> }>(page, "/api/sa-hub/packages?subject=Computer%20Science")
    const free = packages.json.packages.find((item) => item.title === "E2E Fixture: Free Subject")!
    const paid = packages.json.packages.find((item) => item.title === "E2E Fixture: Paid Subject")!
    const freeCheckout = await api<{ enrolledFree: boolean }>(page, "/api/checkout/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemType: "training", itemId: free.id }) })
    expect(freeCheckout.json.enrolledFree).toBe(true)
    const direct = await api(page, `/api/sa-hub/packages/${paid.id}/enrollment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "activate" }) })
    expect(direct.status).toBe(400)
    const checkout = await api<{ checkout: { reference: string } }>(page, "/api/checkout/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemType: "training", itemId: paid.id }) })
    await api(page, "/api/payments/paynow/callback", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ reference: checkout.json.checkout.reference }).toString() })
    const entitlement = await api<{ enrollment: { status: string } }>(page, `/api/sa-hub/packages/${paid.id}/enrollment`)
    expect(entitlement.json.enrollment.status).toBe("active")
  })
})
