// Fires a burst of concurrent requests at a public, Prisma-backed API route to
// check that Neon's pooled connection (lib/prisma.ts: PgBouncer transaction
// mode, `max: 5` per serverless instance) holds up under concurrency without
// surfacing pool-exhaustion errors to callers.
//
// This hits a *running* server (local `next dev`/`next start`, or a deployed
// Vercel URL) over HTTP — it does not open its own direct Postgres
// connections, so it measures the same code path real traffic would hit.
//
// Usage:
//   npx tsx scripts/db-resilience-check.ts
//   BASE_URL=https://dzidzahub.co.zw CONCURRENCY=30 TOTAL_REQUESTS=300 npx tsx scripts/db-resilience-check.ts
import "dotenv/config"

const BASE_URL = process.env.BASE_URL ?? process.env.E2E_BASE_URL ?? "http://localhost:3000"
const ENDPOINT = process.env.RESILIENCE_ENDPOINT ?? "/api/sa-hub/packages"
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 20)
const TOTAL_REQUESTS = Number(process.env.TOTAL_REQUESTS ?? 200)

// Substrings that indicate the pool itself broke, vs. an ordinary 4xx/5xx.
const POOL_ERROR_SIGNATURES = [
  "too many connections",
  "timed out fetching a new connection",
  "connection terminated",
  "econnreset",
  "sorry, too many clients already",
  "remaining connection slots are reserved",
  "P2024", // Prisma: "Timed out fetching a new connection from the connection pool"
]

type Result = {
  ok: boolean
  status: number | null
  ms: number
  error: string | null
  poolError: boolean
}

async function fireOne(): Promise<Result> {
  const start = performance.now()
  try {
    const res = await fetch(`${BASE_URL}${ENDPOINT}`, { cache: "no-store" })
    const ms = performance.now() - start
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      const lower = text.toLowerCase()
      return {
        ok: false,
        status: res.status,
        ms,
        error: text.slice(0, 200),
        poolError: POOL_ERROR_SIGNATURES.some((sig) => lower.includes(sig)),
      }
    }
    return { ok: true, status: res.status, ms, error: null, poolError: false }
  } catch (err) {
    const ms = performance.now() - start
    const message = err instanceof Error ? err.message : String(err)
    const lower = message.toLowerCase()
    return {
      ok: false,
      status: null,
      ms,
      error: message,
      poolError: POOL_ERROR_SIGNATURES.some((sig) => lower.includes(sig)),
    }
  }
}

async function runBatch(size: number): Promise<Result[]> {
  return Promise.all(Array.from({ length: size }, () => fireOne()))
}

async function main() {
  console.log(`Hammering ${BASE_URL}${ENDPOINT}`)
  console.log(`concurrency=${CONCURRENCY} totalRequests=${TOTAL_REQUESTS}\n`)

  const results: Result[] = []
  let remaining = TOTAL_REQUESTS
  while (remaining > 0) {
    const batchSize = Math.min(CONCURRENCY, remaining)
    const batch = await runBatch(batchSize)
    results.push(...batch)
    remaining -= batchSize
    process.stdout.write(`.`.repeat(batchSize))
  }
  console.log("\n")

  const succeeded = results.filter((r) => r.ok)
  const failed = results.filter((r) => !r.ok)
  const poolErrors = results.filter((r) => r.poolError)
  const latencies = results.map((r) => r.ms).sort((a, b) => a - b)
  const p50 = latencies[Math.floor(latencies.length * 0.5)]
  const p95 = latencies[Math.floor(latencies.length * 0.95)]
  const max = latencies[latencies.length - 1]

  console.log("── Summary ──────────────────────────────")
  console.log(`Total requests:   ${results.length}`)
  console.log(`Succeeded (2xx):  ${succeeded.length}`)
  console.log(`Failed:           ${failed.length}`)
  console.log(`Pool-error hits:  ${poolErrors.length}`)
  console.log(`Latency p50/p95/max (ms): ${p50?.toFixed(0)} / ${p95?.toFixed(0)} / ${max?.toFixed(0)}`)

  if (failed.length) {
    console.log("\n── Sample failures ──────────────────────")
    for (const f of failed.slice(0, 10)) {
      console.log(`status=${f.status ?? "network-error"} pool=${f.poolError} :: ${f.error}`)
    }
  }

  if (poolErrors.length > 0) {
    console.error(
      `\n❌ FAIL: ${poolErrors.length} request(s) show Neon/Prisma pool-exhaustion signatures. ` +
        `Consider lowering CONCURRENCY, raising lib/prisma.ts's pool \`max\`, or checking Neon's connection limit for this compute size.`
    )
    process.exit(1)
  }

  if (failed.length > 0) {
    console.error(`\n⚠️  ${failed.length} request(s) failed for non-pool reasons — see failures above.`)
    process.exit(1)
  }

  console.log("\n✅ PASS: all requests succeeded, no connection-pool errors observed.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
