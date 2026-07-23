import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

const PASSWORD_FALLBACK = "E2eTest!Passw0rd"

export type Role = "student" | "instructor" | "internal_instructor" | "admin"

export const CREDENTIALS: Record<Role, { email: string; password: string }> = {
  student: {
    email: process.env.E2E_STUDENT_EMAIL?.trim() || "e2e.student@dzidzahub.test",
    password: process.env.E2E_STUDENT_PASSWORD?.trim() || PASSWORD_FALLBACK,
  },
  instructor: {
    email: process.env.E2E_INSTRUCTOR_EMAIL?.trim() || "e2e.instructor@dzidzahub.test",
    password: process.env.E2E_INSTRUCTOR_PASSWORD?.trim() || PASSWORD_FALLBACK,
  },
  internal_instructor: {
    email: process.env.E2E_CONTENT_MANAGER_EMAIL?.trim() || "e2e.contentmanager@dzidzahub.test",
    password: process.env.E2E_CONTENT_MANAGER_PASSWORD?.trim() || PASSWORD_FALLBACK,
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL?.trim() || "e2e.admin@dzidzahub.test",
    password: process.env.E2E_ADMIN_PASSWORD?.trim() || PASSWORD_FALLBACK,
  },
}

// Where each role lands after a successful login (mirrors app/login/page.tsx's
// redirect switch — admin/internal_instructor/instructor go to their console,
// everyone else (student) goes to /dashboard).
export const POST_LOGIN_PATH: Record<Role, string> = {
  student: "/dashboard",
  instructor: "/instructor",
  internal_instructor: "/internal-instructor",
  admin: "/admin",
}

/** Drives the real /login form — this is intentionally UI-driven, not an API shortcut,
 * since exercising the actual login form is part of what this suite is verifying. */
export async function loginAs(page: Page, role: Role) {
  const { email, password } = CREDENTIALS[role]
  await page.goto("/login")
  await page.getByPlaceholder("you@example.com").fill(email)
  await page.getByPlaceholder("••••••••").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL(`**${POST_LOGIN_PATH[role]}**`, { timeout: 15_000 })
}

export async function logout(page: Page) {
  await page.getByText("Log out", { exact: true }).first().click()
  await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
}
