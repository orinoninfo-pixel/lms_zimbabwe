import { test, expect } from "@playwright/test"
import { loginAs } from "./utils/auth"

/**
 * Uses the fixture course created by `npm run seed:e2e`
 * (scripts/seed-e2e-users.ts: "E2E Fixture: Free Course", price 0, category
 * "E2E Test Category", already approved) rather than a course created earlier
 * in this run. Deliberately independent of course-approval.spec.ts so either
 * file can run alone.
 *
 * Price is $0 specifically so this test never touches the project's live
 * Paynow integration (see app/api/checkout/prepare/route.ts — price > 0
 * courses redirect off-site to a real payment gateway, which is out of scope
 * for an automated suite running against real credentials).
 */
const FIXTURE_COURSE_TITLE = "E2E Fixture: Free Course"
const FIXTURE_CATEGORY_SLUG = "e2e-test-category"

test.describe("Student browsing and enrollment", () => {
  test("category page filters to courses in that category", async ({ page }) => {
    await page.goto("/categories")
    await expect(page.getByText("E2E Test Category")).toBeVisible()

    await page.getByText("E2E Test Category").click()
    await expect(page).toHaveURL(new RegExp(`/categories/${FIXTURE_CATEGORY_SLUG}$`))
    await expect(page.getByText(FIXTURE_COURSE_TITLE)).toBeVisible({ timeout: 10_000 })
  })

  test("public catalog lists the fixture course", async ({ page }) => {
    await page.goto("/courses")
    await expect(page.getByText(FIXTURE_COURSE_TITLE)).toBeVisible({ timeout: 10_000 })
  })

  test("student can enroll in the free fixture course and it appears on their dashboard", async ({ page }) => {
    await loginAs(page, "student")

    await page.goto("/courses")
    await page.getByText(FIXTURE_COURSE_TITLE).click()
    await expect(page).toHaveURL(/\/course\/[0-9a-f-]+$/)

    // Idempotent across repeat runs: if a previous run already enrolled this
    // student, the sidebar renders "Open Course" instead of the enroll CTA.
    const openCourse = page.getByRole("link", { name: "Open Course" })
    const enrollFree = page.getByRole("button", { name: "Enroll for Free" })

    if (await openCourse.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await openCourse.click()
    } else {
      await expect(enrollFree).toBeVisible({ timeout: 10_000 })
      await enrollFree.click()
    }

    await expect(page).toHaveURL(/\/learn\/[0-9a-f-]+$/, { timeout: 15_000 })

    await page.goto("/dashboard")
    await expect(page.getByText(FIXTURE_COURSE_TITLE)).toBeVisible({ timeout: 10_000 })
  })

  test("unauthenticated enroll attempt redirects to login with a return path", async ({ page, context }) => {
    await context.clearCookies()
    await page.goto("/courses")
    await page.getByText(FIXTURE_COURSE_TITLE).click()

    const enrollButton = page.getByRole("button", { name: /enroll for free|pay with paynow/i })
    await enrollButton.click()
    await expect(page).toHaveURL(/\/login\?next=/)
  })
})
