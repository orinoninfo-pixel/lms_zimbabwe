import test from "node:test"
import assert from "node:assert/strict"
import { validateImageFile } from "../../lib/storage"

test("image validation checks binary signature instead of filename", async () => {
  const validPng = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "cover.png", { type: "image/png" })
  assert.equal((await validateImageFile(validPng)).extension, "png")
  const disguised = new File(["not an image"], "cover.png", { type: "image/png" })
  await assert.rejects(validateImageFile(disguised), /does not match/)
})

test("image validation rejects oversized input", async () => {
  const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" })
  await assert.rejects(validateImageFile(oversized), /5 MB/)
})
