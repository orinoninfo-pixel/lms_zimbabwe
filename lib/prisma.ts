import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; pgPool?: Pool }

// DATABASE_URL must be Neon's *pooled* connection string (the one with
// "-pooler" in the hostname, PgBouncer in transaction mode). Each Vercel
// serverless function instance gets its own copy of this module and its own
// pool, so `max` here is a per-instance ceiling, not a global one — keep it
// small so concurrent invocations can't add up past Postgres's own
// connection limit even when PgBouncer is multiplexing behind them.
// DIRECT_URL (unpooled) stays reserved for `prisma migrate` in prisma.config.ts.
const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  })

// Cache on globalThis in every environment, not just dev: within one warm
// serverless instance this is the only thing stopping every re-invocation of
// this module (or a Next.js dev/HMR reload) from opening a fresh pool.
globalForPrisma.prisma = prisma
globalForPrisma.pgPool = pool
