"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ImageUpload({ entityType, entityId, initialUrl }: { entityType: "course" | "tutorial"; entityId: string; initialUrl?: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function upload(file: File) { setBusy(true); setError(null); const form = new FormData(); form.set("entityType", entityType); form.set("entityId", entityId); form.set("file", file); const response = await fetch("/api/uploads/images", { method: "POST", body: form }); const json = await response.json().catch(() => null); if (response.ok) setUrl(json.imageUrl); else setError(json?.error ?? "Upload failed"); setBusy(false) }
  async function remove() { setBusy(true); const response = await fetch("/api/uploads/images", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entityType, entityId }) }); if (response.ok) setUrl(null); setBusy(false) }
  return <div className="space-y-3"><Label htmlFor={`${entityType}-image`}>Cover image</Label>{url ? <div className="relative aspect-video max-w-md overflow-hidden rounded-lg border border-border"><Image src={url} alt="Current cover" fill className="object-cover" unoptimized /></div> : null}<Input id={`${entityType}-image`} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file) }} /><p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Maximum 5 MB. File content is verified before storage.</p>{url ? <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void remove()}>Remove image</Button> : null}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>
}
