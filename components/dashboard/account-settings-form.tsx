"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

type MeResponse = {
  user: { id: string; name: string; email: string; role: string; status?: string } | null
  session: { userId: string; role: string } | null
}

export function AccountSettingsForm() {
  const [me, setMe] = useState<MeResponse["user"]>(null)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null)
      const json = res ? ((await res.json().catch(() => null)) as MeResponse | null) : null
      if (cancelled) return
      const user = json?.user ?? null
      setMe(user)
      setName(user?.name ?? "")
      setIsLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const initials = useMemo(() => {
    const value = (name || me?.name || "U").trim()
    return (
      value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("") || "U"
    )
  }, [name, me?.name])

  const save = async () => {
    setBusy(true)
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Save failed")
      toast({ title: "Settings saved" })
      setMe(json?.user ?? me)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
      toast({ title: "Save failed", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{me?.name ?? "Account"}</p>
              <p className="text-xs text-muted-foreground truncate">{me?.email ?? ""}</p>
            </div>
          </div>
          <Button variant="outline" disabled className="w-full">
            Change photo
          </Button>
          <p className="text-xs text-muted-foreground">Profile images are not configured yet. Initials are used.</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="name">
                Name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <Input id="email" value={me?.email ?? ""} readOnly disabled />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">Password</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Password changes are not available with the current authentication method.
            </p>
            <Button variant="outline" disabled className="mt-3">
              Change password
            </Button>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => void save()} disabled={busy || !name.trim()}>
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

