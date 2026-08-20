import { isSafeE2ETestMode } from "@/lib/test-database"

export function postgresConnectionOptions() {
  const raw = process.env.TEST_DATABASE_URL?.trim() || process.env.DATABASE_URL
  if (!raw) throw new Error("DATABASE_URL is required")
  const url = new URL(raw)
  const sslMode = url.searchParams.get("sslmode")
  const schema = url.searchParams.get("schema")?.trim() || undefined
  url.searchParams.delete("sslmode")
  url.searchParams.delete("uselibpqcompat")
  url.searchParams.delete("schema")
  const isolatedE2E = isSafeE2ETestMode()
  const useTls = (process.env.NODE_ENV === "production" && !isolatedE2E) || Boolean(sslMode && sslMode !== "disable")
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n")
  return { poolConfig: { connectionString: url.toString(), ...(useTls ? { ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) } } : {}) }, schema }
}
