import dotenv from "dotenv"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { resolveTestDatabaseUrl } from "../lib/test-database"

dotenv.config({ path: ".env.test.local", override: true })
dotenv.config({ path: ".env.local" })
const testUrl = resolveTestDatabaseUrl()
const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "test", TEST_DATABASE_URL: testUrl, DATABASE_URL: testUrl, DIRECT_URL: testUrl }

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { cwd: process.cwd(), env, stdio: "inherit", shell: false })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const prismaCli = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js")
const testBootstrap = "./tests/setup-tsx.mjs"
run(process.execPath, [prismaCli, "migrate", "reset", "--force"])
run(process.execPath, ["--import", testBootstrap, "--import", "tsx", "prisma/seed.ts"])
run(process.execPath, ["--import", testBootstrap, "--import", "tsx", "scripts/seed-e2e-users.ts"])
console.log("Dedicated test schema reset, migrated, and seeded successfully.")
