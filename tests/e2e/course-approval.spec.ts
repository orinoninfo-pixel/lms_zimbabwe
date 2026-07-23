import { test, expect } from "@playwright/test"
import { loginAs, logout } from "./utils/auth"
import { fillCourseDetailsStep, buildMinimalCurriculum } from "./utils/course-builder"

/**
 * Full course lifecycle: Content Manager creates + submits → Admin approves →
 * Student sees it live. Runs as one continuous scenario (test.step per stage)
 * because each stage depends on state the previous stage produced (the course
 * id, its "pending" status). Each stage still logs in/out for real through the
 * UI as its own role, so this exercises the same session boundaries a real
 * handoff between three different people would.
 *
 * Uses a timestamped title so repeated runs don't collide with earlier ones
 * left in the DB (this suite doesn't delete the course it creates — cleanup
 * is a manual/DB-side concern, see QA_CHECKLIST.md).
 */
test("content manager course lifecycle: draft -> pending -> approved -> visible to students", async ({ page }) => {
  const courseTitle = `E2E Course ${Date.now()}`
  const courseDescription =
    "This is a Playwright-generated end-to-end test course. It exists only to verify the approval workflow " +
    "and is safe to delete from the admin console at any time."

  await test.step("Content Manager: create course and save as draft", async () => {
    await loginAs(page, "internal_instructor")
    await page.goto("/internal-instructor/courses/new")

    await fillCourseDetailsStep(page, { title: courseTitle, description: courseDescription, price: "0" })
    await page.getByRole("button", { name: "Save Draft" }).click()
    await expect(page.getByText(/draft saved/i)).toBeVisible({ timeout: 10_000 })
  })

  await test.step("Content Manager: add curriculum and submit for review", async () => {
    await page.getByRole("button", { name: "Next" }).click() // step 2: curriculum
    await buildMinimalCurriculum(page)
    await page.getByRole("button", { name: "Next" }).click() // step 3: publish

    const submitButton = page.getByRole("button", { name: "Submit for Review" })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()
    await expect(page).toHaveURL(/\/internal-instructor\/courses$/)
  })

  await test.step("Content Manager: course list shows the course under review", async () => {
    await expect(page.getByText(courseTitle)).toBeVisible()
    await expect(page.getByText(/under review|pending/i).first()).toBeVisible()
    await logout(page)
  })

  await test.step("Admin: find the pending course and approve it", async () => {
    await loginAs(page, "admin")
    await page.goto("/admin/courses")

    await page.getByPlaceholder(/search title, description, instructor/i).fill(courseTitle)
    await expect(page.getByText(courseTitle)).toBeVisible({ timeout: 10_000 })

    await page.getByRole("link", { name: /review/i }).first().click()
    await expect(page).toHaveURL(/\/admin\/courses\/[0-9a-f-]+$/)

    // Category must be set here — the wizard never actually persists one
    // (see tests/e2e/utils/course-builder.ts) — the approval checklist
    // requires it, so "Save and Approve" stays disabled without this.
    const categorySelect = page.locator("#admin-course-category")
    await categorySelect.selectOption({ index: 1 })

    const approveButton = page.getByRole("button", { name: "Save and Approve" })
    await expect(approveButton).toBeEnabled({ timeout: 10_000 })
    await approveButton.click()
    await expect(page.getByText(/course reviewed/i)).toBeVisible({ timeout: 10_000 })

    await logout(page)
  })

  await test.step("Student: newly approved course is visible in the public catalog", async () => {
    await loginAs(page, "student")

    await page.goto("/courses")
    await expect(page.getByText(courseTitle)).toBeVisible({ timeout: 10_000 })

    await page.getByText(courseTitle).click()
    await expect(page).toHaveURL(/\/course\/[0-9a-f-]+$/)
    await expect(page.getByRole("heading", { name: courseTitle })).toBeVisible()

    await logout(page)
  })
})
