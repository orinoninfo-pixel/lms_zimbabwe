import type { Page } from "@playwright/test"

/**
 * Fills step 1 (Course Details) of the course-creator wizard used by both
 * /instructor/courses/new and /internal-instructor/courses/new (same shared
 * components/instructor/course-creator/* components).
 *
 * NOTE — verified finding: the Category / Level / Language selects on this
 * step are collected into local state but are NEVER included in the POST/PATCH
 * body sent to /api/{instructor,internal-instructor}/courses (see
 * app/instructor/courses/new/page.tsx's handleSave/handlePublish — the request
 * body only has title/description/price/status/sections). They exist purely to
 * satisfy the client-side `isReadyToPublish` gate before "Submit for Review"
 * unlocks. The course's real `categoryId` stays null until an admin sets one
 * on the review page. We still fill them here because the button is disabled
 * otherwise — see QA_CHECKLIST.md for this as a flagged product bug.
 */
export async function fillCourseDetailsStep(
  page: Page,
  opts: { title: string; description: string; price: string }
) {
  await page.locator("#title").fill(opts.title)
  await page.locator("#description").fill(opts.description)
  await page.locator("#price").fill(opts.price)

  await page.getByText("Select a category").click()
  await page.getByRole("option").first().click()

  await page.getByText("Select a level").click()
  await page.getByRole("option").first().click()
}

/** Adds one section with 3 lessons — the minimum the wizard requires
 * (`sections.length > 0 && totalLessons >= 3`) before Submit for Review unlocks. */
export async function buildMinimalCurriculum(page: Page) {
  await page.getByRole("button", { name: "Add Section", exact: true }).click()
  const addVideo = page.getByRole("button", { name: "Add Video" })
  await addVideo.click()
  await addVideo.click()
  await addVideo.click()
}
