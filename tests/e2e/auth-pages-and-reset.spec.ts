import { expect, test } from "@playwright/test"

function uniqueEmail() {
  return `reset-${Date.now()}-${Math.floor(Math.random() * 10000)}@dzidzahub.test`
}

function getTokenFromResetUrl(resetUrl: string) {
  const url = new URL(resetUrl)
  return url.searchParams.get("token") || ""
}

test.describe("Authentication pages navigation and theming", () => {
  test("home navigation is visible and works on login/register/forgot/reset pages", async ({ page }) => {
    test.setTimeout(120_000)
    test.slow()

    const pages = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password?token=dummy-token",
    ]

    for (const route of pages) {
      await page.goto(route, { waitUntil: "networkidle" })

      await expect(page.getByRole("link", { name: "Go to Zim Learning home" })).toBeVisible()
      await expect(page.getByRole("link", { name: "← Back to home" })).toBeVisible()

      await page.getByRole("link", { name: "← Back to home" }).click()
      await expect(page).toHaveURL("/")
    }
  })

  test("theme choice persists across authentication pages", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Select theme" }).click()
    await page.getByRole("menuitem", { name: /Green/i }).click()

    await expect(page.locator("html")).toHaveClass(/green/)

    await page.goto("/register")
    await expect(page.locator("html")).toHaveClass(/green/)

    await page.goto("/forgot-password")
    await expect(page.locator("html")).toHaveClass(/green/)

    await page.goto("/reset-password?token=dummy-token")
    await expect(page.locator("html")).toHaveClass(/green/)
  })
})

test.describe("Password reset API flow", () => {
  test("forgot-password returns generic success for existing and non-existing accounts", async ({ request }) => {
    const existingEmail = uniqueEmail()

    const registerRes = await request.post("/api/auth/register", {
      data: { email: existingEmail, password: "TempPass!123" },
    })
    expect(registerRes.ok()).toBeTruthy()

    const known = await request.post("/api/auth/forgot-password", {
      data: { email: existingEmail },
    })
    expect(known.ok()).toBeTruthy()
    const knownBody = await known.json()
    expect(knownBody.message).toContain("If an account exists")

    const unknown = await request.post("/api/auth/forgot-password", {
      data: { email: uniqueEmail() },
    })
    expect(unknown.ok()).toBeTruthy()
    const unknownBody = await unknown.json()
    expect(unknownBody.message).toContain("If an account exists")
  })

  test("supports valid token reset and blocks reused token", async ({ request }) => {
    const email = uniqueEmail()

    const registerRes = await request.post("/api/auth/register", {
      data: { email, password: "TempPass!123" },
    })
    expect(registerRes.ok()).toBeTruthy()

    const forgotRes = await request.post("/api/auth/forgot-password", {
      data: { email },
    })
    expect(forgotRes.ok()).toBeTruthy()

    const forgotBody = await forgotRes.json()
    expect(typeof forgotBody.debugResetUrl).toBe("string")

    const token = getTokenFromResetUrl(forgotBody.debugResetUrl as string)
    expect(token.length).toBeGreaterThan(20)

    const resetOk = await request.post("/api/auth/reset-password", {
      data: {
        token,
        newPassword: "UpdatedPass!123",
        confirmPassword: "UpdatedPass!123",
      },
    })
    expect(resetOk.ok()).toBeTruthy()

    const resetReused = await request.post("/api/auth/reset-password", {
      data: {
        token,
        newPassword: "AnotherPass!123",
        confirmPassword: "AnotherPass!123",
      },
    })
    expect(resetReused.status()).toBe(400)
    const reusedBody = await resetReused.json()
    expect(String(reusedBody.error || "")).toMatch(/already been used|invalid|expired/i)
  })

  test("rejects invalid token, mismatch password, and weak password", async ({ request }) => {
    const invalidTokenResponse = await request.post("/api/auth/reset-password", {
      data: {
        token: "invalid-token",
        newPassword: "UpdatedPass!123",
        confirmPassword: "UpdatedPass!123",
      },
    })
    expect(invalidTokenResponse.status()).toBe(400)

    const email = uniqueEmail()
    const registerRes = await request.post("/api/auth/register", {
      data: { email, password: "TempPass!123" },
    })
    expect(registerRes.ok()).toBeTruthy()

    const forgotRes = await request.post("/api/auth/forgot-password", {
      data: { email },
    })
    const forgotBody = await forgotRes.json()
    const token = getTokenFromResetUrl(String(forgotBody.debugResetUrl || ""))

    const mismatchResponse = await request.post("/api/auth/reset-password", {
      data: {
        token,
        newPassword: "UpdatedPass!123",
        confirmPassword: "DifferentPass!123",
      },
    })
    expect(mismatchResponse.status()).toBe(400)

    const weakResponse = await request.post("/api/auth/reset-password", {
      data: {
        token,
        newPassword: "short",
        confirmPassword: "short",
      },
    })
    expect(weakResponse.status()).toBe(400)
  })

  test("applies rate limiting on repeated reset requests", async ({ request }) => {
    const email = uniqueEmail()

    for (let i = 0; i < 3; i += 1) {
      const res = await request.post("/api/auth/forgot-password", {
        data: { email },
      })
      expect(res.ok()).toBeTruthy()
    }

    const limited = await request.post("/api/auth/forgot-password", {
      data: { email },
    })

    expect(limited.status()).toBe(429)
  })
})

test.describe("Reset page invalid-link handling", () => {
  test("missing reset token redirects to invalid-link page", async ({ page }) => {
    await page.goto("/reset-password")
    await expect(page).toHaveURL(/\/reset-password-invalid$/)
    await expect(page.getByText(/invalid, expired, or has already been used/i)).toBeVisible()
  })
})
