import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "../lib/generated/prisma/client"

const categories: Array<{ name: string; slug: string }> = [
  { name: "IT & Software", slug: "it-software" },
  { name: "Business", slug: "business" },
  { name: "Design", slug: "design" },
  { name: "Mathematics", slug: "mathematics" },
  { name: "Exam Preparation", slug: "exam-preparation" },
  { name: "Homework Help", slug: "homework-help" },
  { name: "Holiday Catch-up", slug: "holiday-catch-up" },
  { name: "Mathematical Literacy", slug: "mathematical-literacy" },
  { name: "Physical Sciences", slug: "physical-sciences" },
  { name: "Life Sciences", slug: "life-sciences" },
  { name: "Accounting", slug: "accounting" },
  { name: "Business Studies", slug: "business-studies" },
  { name: "Economics", slug: "economics" },
  { name: "English", slug: "english" },
  { name: "Afrikaans", slug: "afrikaans" },
  { name: "Geography", slug: "geography" },
  { name: "History", slug: "history" },
  { name: "CAT", slug: "cat" },
  { name: "IT", slug: "it" },
]

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    const results = []
    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: category,
        select: { id: true, name: true, slug: true },
      })
      results.push(created)
    }
    console.log(JSON.stringify({ success: true, count: results.length, categories: results }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
