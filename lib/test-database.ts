export function resolveTestDatabaseUrl() {
  const source = process.env.TEST_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  if (!source) throw new Error("TEST_DATABASE_URL or DATABASE_URL is required for tests")
  const url = new URL(source)
  if (!process.env.TEST_DATABASE_URL) url.searchParams.set("schema", "dzidzahub_test")
  const databaseName = url.pathname.toLowerCase()
  const schema = url.searchParams.get("schema")?.toLowerCase() ?? ""
  if (!databaseName.includes("test") && !schema.includes("test")) throw new Error("Refusing destructive tests: test database URL must contain 'test' in its database or schema name")
  return url.toString()
}

export function isExplicitTestDatabaseUrl(source: string | undefined) {
  if (!source?.trim()) return false
  try {
    const url = new URL(source)
    const databaseName = url.pathname.toLowerCase()
    const schema = url.searchParams.get("schema")?.toLowerCase() ?? ""
    return databaseName.includes("test") || schema.includes("test")
  } catch {
    return false
  }
}

export function isSafeE2ETestMode() {
  return process.env.E2E_TEST_MODE === "1" && isExplicitTestDatabaseUrl(process.env.TEST_DATABASE_URL)
}
