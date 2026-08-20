import test from "node:test"
import assert from "node:assert/strict"
import { postgresConnectionOptions } from "../../lib/database-url"

test("production database options enforce certificate verification and remove ambiguous sslmode", () => {
  const previousUrl = process.env.DATABASE_URL
  const previousNodeEnv = process.env.NODE_ENV
  process.env.DATABASE_URL = "postgresql://user:pass@example.com/app?sslmode=require"
  Object.assign(process.env, { NODE_ENV: "production" })
  try {
    const options = postgresConnectionOptions()
    assert.equal(options.poolConfig.connectionString.includes("sslmode"), false)
    assert.deepEqual(options.poolConfig.ssl, { rejectUnauthorized: true })
  } finally {
    process.env.DATABASE_URL = previousUrl
    Object.assign(process.env, { NODE_ENV: previousNodeEnv })
  }
})
