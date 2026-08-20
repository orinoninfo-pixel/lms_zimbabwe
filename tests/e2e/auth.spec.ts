import { test, expect } from "@playwright/test"
import { loginAs, logout, CREDENTIALS, POST_LOGIN_PATH, type Role } from "./utils/auth"

/**
 * IMPORTANT — actual redirect behavior differs from the "redirect to /login or
 * their dashboard" assumption in the original test brief. As implemented today
 * (app/admin/layout.tsx, app/internal-instructor/layout.tsx, app/dashboard/page.tsx,
 * all via lib/rbac.ts's requireRoleForPage):
 * Dashboard and instructor routes now have server-side layout guards. Their
 * unauthenticated and wrong-role redirects go to /login before private UI renders.
 */

const roles: Role[] = ["student", "instructor", "internal_instructor", "admin"]

test.describe("Login", () => {
  for (const role of roles) {
    test(`${role} can log in and lands on ${POST_LOGIN_PATH[role]}`, async ({ page }) => {
      await loginAs(page, role)
      await expect(page).toHaveURL(new RegExp(POST_LOGIN_PATH[role].replace("/", "\\/") + "$"))
    })
  }

  test("shows an error on wrong password and does not navigate away from /login", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("you@example.com").fill(CREDENTIALS.student.email)
    await page.getByPlaceholder("••••••••").fill("definitely-the-wrong-password")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText(/invalid|incorrect|does not match|failed/i)).toBeVisible({ timeout: 10_000 })
  })
})

test.describe("Logout", () => {
  for (const role of roles) {
    test(`${role} can log out and returns to home`, async ({ page }) => {
      await loginAs(page, role)
      await logout(page)
      // Re-visiting the gated route after logout must bounce again — proves
      // the session cookie was actually cleared, not just a client nav away.
      await page.goto(POST_LOGIN_PATH[role])
      if (role === "student" || role === "instructor") await expect(page).toHaveURL(/\/login$/)
      else await expect(page).toHaveURL("/")
    })
  }
})

test.describe("Route protection — unauthenticated visitors", () => {
  const gatedRoutes = ["/admin", "/admin/transactions", "/internal-instructor"]

  for (const route of gatedRoutes) {
    test(`anonymous visit to ${route} redirects to home`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL("/")
    })
  }

  test("anonymous visit to /dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("anonymous visit to /instructor/courses/new redirects to login server-side", async ({
    page,
  }) => {
    await page.goto("/instructor/courses/new")
    await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 })
  })
})

test.describe("Route protection — cross-role access", () => {
  test("student opening /admin is redirected to home, not the admin console", async ({ page }) => {
    await loginAs(page, "student")
    await page.goto("/admin")
    await expect(page).toHaveURL("/")
  })

  test("student opening /internal-instructor is redirected to home", async ({ page }) => {
    await loginAs(page, "student")
    await page.goto("/internal-instructor")
    await expect(page).toHaveURL("/")
  })

  test("content manager opening /admin/transactions is redirected to home", async ({ page }) => {
    await loginAs(page, "internal_instructor")
    await page.goto("/admin/transactions")
    await expect(page).toHaveURL("/")
  })

  test("content manager opening /admin is redirected to home", async ({ page }) => {
    await loginAs(page, "internal_instructor")
    await page.goto("/admin")
    await expect(page).toHaveURL("/")
  })

  test("external instructor opening /admin is redirected to home", async ({ page }) => {
    await loginAs(page, "instructor")
    await page.goto("/admin")
    await expect(page).toHaveURL("/")
  })

  test("external instructor opening /internal-instructor is redirected to home", async ({ page }) => {
    await loginAs(page, "instructor")
    await page.goto("/internal-instructor")
    await expect(page).toHaveURL("/")
  })

  test("admin opening /dashboard (student area) is redirected to login", async ({ page }) => {
    await loginAs(page, "admin")
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("student opening /instructor/courses/new is rejected by the server layout", async ({ page }) => {
    await loginAs(page, "student")
    await page.goto("/instructor/courses/new")
    await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 })
  })
})
