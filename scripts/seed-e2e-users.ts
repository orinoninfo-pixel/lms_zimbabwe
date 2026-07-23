// Provisions dedicated, disposable accounts + fixture data for the Playwright
// E2E suite (tests/e2e/**). Deliberately separate from prisma/seed.ts:
// - prisma/seed.ts's users have no passwordHash and can't log in via the UI.
// - The only real password-bearing accounts in this repo today are the live
//   production admin/content-manager creds in .env — this suite must never
//   depend on those, so it gets its own e2e.*@dzidzahub.test accounts instead.
//
// Safe to re-run (upserts). Run against whichever DATABASE_URL is active —
// prefer a Neon branch/staging database over production for this suite.
import "dotenv/config"
import { hash } from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "../lib/generated/prisma/client"

const PASSWORD_FALLBACK = "E2eTest!Passw0rd"

const accounts = [
  {
    email: process.env.E2E_STUDENT_EMAIL?.trim() || "e2e.student@dzidzahub.test",
    password: process.env.E2E_STUDENT_PASSWORD?.trim() || PASSWORD_FALLBACK,
    name: "E2E Student",
    role: "student" as const,
  },
  {
    email: process.env.E2E_INSTRUCTOR_EMAIL?.trim() || "e2e.instructor@dzidzahub.test",
    password: process.env.E2E_INSTRUCTOR_PASSWORD?.trim() || PASSWORD_FALLBACK,
    name: "E2E Instructor",
    role: "instructor" as const,
  },
  {
    email: process.env.E2E_CONTENT_MANAGER_EMAIL?.trim() || "e2e.contentmanager@dzidzahub.test",
    password: process.env.E2E_CONTENT_MANAGER_PASSWORD?.trim() || PASSWORD_FALLBACK,
    name: "E2E Content Manager",
    role: "internal_instructor" as const,
  },
  {
    email: process.env.E2E_ADMIN_EMAIL?.trim() || "e2e.admin@dzidzahub.test",
    password: process.env.E2E_ADMIN_PASSWORD?.trim() || PASSWORD_FALLBACK,
    name: "E2E Admin",
    role: "admin" as const,
  },
]

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    const createdUsers: Record<string, { id: string; email: string; role: string }> = {}

    for (const account of accounts) {
      const passwordHash = await hash(account.password, 10)
      const user = await prisma.user.upsert({
        where: { email: account.email },
        update: {
          name: account.name,
          role: account.role,
          status: "active",
          passwordHash,
          mustChangePassword: false,
          resetToken: null,
          resetTokenExpiresAt: null,
        },
        create: {
          email: account.email,
          name: account.name,
          role: account.role,
          status: "active",
          passwordHash,
          mustChangePassword: false,
        },
        select: { id: true, email: true, role: true },
      })
      createdUsers[account.role] = user
    }

    const category = await prisma.category.upsert({
      where: { slug: "e2e-test-category" },
      update: { name: "E2E Test Category" },
      create: { name: "E2E Test Category", slug: "e2e-test-category" },
      select: { id: true, name: true, slug: true },
    })

    // A stable, always-approved, always-free course so enrollment.spec.ts can
    // run independently of course-approval.spec.ts (which creates its own
    // throwaway pending course each run). Free price avoids ever touching the
    // live Paynow integration configured in this project's .env.
    const instructorId = createdUsers["instructor"].id
    const existingCourse = await prisma.course.findFirst({
      where: { instructorId, title: "E2E Fixture: Free Course" },
      select: { id: true },
    })

    const course = existingCourse
      ? await prisma.course.update({
          where: { id: existingCourse.id },
          data: { status: "approved", price: 0, categoryId: category.id },
          select: { id: true, title: true, status: true },
        })
      : await prisma.course.create({
          data: {
            title: "E2E Fixture: Free Course",
            description:
              "Seeded fixture course used by the Playwright enrollment spec. Safe to ignore in the real catalog.",
            price: 0,
            status: "approved",
            categoryId: category.id,
            instructorId,
            sections: {
              create: [
                {
                  title: "Section 1",
                  order: 0,
                  lessons: {
                    create: [
                      { title: "Lesson 1", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", order: 0 },
                      { title: "Lesson 2", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", order: 1 },
                      { title: "Lesson 3", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", order: 2 },
                    ],
                  },
                },
              ],
            },
          },
          select: { id: true, title: true, status: true },
        })

    console.log(
      JSON.stringify(
        {
          success: true,
          accounts: Object.values(createdUsers),
          category,
          fixtureCourse: course,
          note: "Passwords are whatever you set via E2E_*_PASSWORD env vars, or the fallback baked into this script/tests/e2e/utils/auth.ts if unset.",
        },
        null,
        2
      )
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
