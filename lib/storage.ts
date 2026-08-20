import { randomUUID } from "crypto"
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const imageTypes = {
  "image/jpeg": { extension: "jpg", matches: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: "png", matches: (bytes: Uint8Array) => bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 },
  "image/webp": { extension: "webp", matches: (bytes: Uint8Array) => new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP" },
} as const

function configuration() {
  const values = {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
  }
  if (Object.values(values).some((value) => !value?.trim())) throw new Error("Object storage is not configured")
  return values as Record<keyof typeof values, string>
}

function client(config: ReturnType<typeof configuration>) {
  return new S3Client({ endpoint: config.endpoint, region: config.region, forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } })
}

export async function validateImageFile(file: File) {
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) throw new Error("Image must be between 1 byte and 5 MB")
  const type = imageTypes[file.type as keyof typeof imageTypes]
  if (!type) throw new Error("Only JPEG, PNG, and WebP images are allowed")
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!type.matches(bytes)) throw new Error("Image content does not match its declared MIME type")
  return { bytes, extension: type.extension, contentType: file.type }
}

export async function uploadImage(file: File, namespace: "courses" | "tutorials", entityId: string) {
  const config = configuration()
  const validated = await validateImageFile(file)
  const key = `${namespace}/${entityId}/${randomUUID()}.${validated.extension}`
  await client(config).send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: validated.bytes, ContentType: validated.contentType, CacheControl: "public, max-age=31536000, immutable" }))
  return { key, url: `${config.publicBaseUrl.replace(/\/$/, "")}/${key}` }
}

export async function deleteStoredImage(publicUrl: string | null | undefined) {
  if (!publicUrl) return
  const config = configuration()
  const base = `${config.publicBaseUrl.replace(/\/$/, "")}/`
  if (!publicUrl.startsWith(base)) return
  const key = publicUrl.slice(base.length)
  if (!/^(courses|tutorials)\/[0-9a-f-]+\/[0-9a-f-]+\.(jpg|png|webp)$/i.test(key)) return
  await client(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }))
}
