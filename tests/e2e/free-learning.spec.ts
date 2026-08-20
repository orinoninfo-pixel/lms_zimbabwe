import { test, expect } from "@playwright/test"
import { loginAs } from "./utils/auth"

test.describe("Dzidza Free Learning", () => {
  test("anonymous visitors can browse and navigate the Python tutorial", async ({ page }) => {
    await page.goto("/learn")
    await expect(page.getByRole("heading", { name: "Practical skills, explained one clear step at a time." })).toBeVisible()
    const pythonTutorial = page.getByRole("link", { name: /Python Foundations/ })
    await expect(pythonTutorial).toHaveAttribute("href", "/learn/python")
    await page.goto("/learn/python", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Meet Python" })).toBeVisible()
    await page.getByRole("link", { name: /Your Python Workspace/ }).last().click()
    await expect(page).toHaveURL(/\/learn\/python\/setup$/)
    await expect(page.getByText("Reading remains free.")).toBeVisible()
  })

  test("students can complete and bookmark a tutorial lesson", async ({ page }) => {
    await loginAs(page, "student")
    await page.goto("/learn/python/variables-and-data-types", { waitUntil: "domcontentloaded" })
    const complete = page.getByRole("button", { name: /Mark lesson complete|Completed/ })
    if ((await complete.textContent())?.includes("Mark lesson complete")) await complete.click()
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible()
    const bookmark = page.getByRole("button", { name: /Bookmark lesson|Remove bookmark/ })
    if ((await bookmark.getAttribute("aria-label")) === "Bookmark lesson") await bookmark.click()
    await page.reload()
    await expect(page.getByRole("button", { name: "Remove bookmark" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible()
  })

  test("tutorial navigation works at a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/learn/python/introduction")
    await expect(page.getByRole("button", { name: /Lessons/ })).toBeVisible()
    await page.getByRole("button", { name: /Lessons/ }).click()
    await expect(page.getByPlaceholder("Search this tutorial").last()).toBeVisible()
  })

  test("published tutorial lessons appear in typed search results", async ({ page }) => {
    await page.goto("/search?q=variables")
    await expect(page.getByText("Tutorial Lesson", { exact: true }).first()).toBeVisible()
    await expect(page.getByRole("heading", { name: "Variables and Data Types" })).toBeVisible()
  })
})
