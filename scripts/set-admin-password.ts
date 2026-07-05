import "dotenv/config"
import { hash } from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "../lib/generated/prisma/client"

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim() || "admin@lms.local"
  const password = process.env.ADMIN_PASSWORD?.trim()

  if (!password || password.length < 8) {
    throw new Error("Set ADMIN_PASSWORD to at least 8 characters before running this script.")
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    const passwordHash = await hash(password, 10)

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: "Naledi Admin",
        role: "admin",
        status: "active",
        passwordHash,
        mustChangePassword: false,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
      create: {
        email,
        name: "Naledi Admin",
        role: "admin",
        status: "active",
        passwordHash,
        mustChangePassword: false,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    })

    console.log(JSON.stringify({ success: true, user }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
