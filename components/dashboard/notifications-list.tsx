"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { toast } from "@/hooks/use-toast"

type NotificationRow = {
  id: string
  title: string
  body: string | null
  href: string | null
  readAt: string | null
  createdAt: string
}

export function NotificationsList() {
  const [rows, setRows] = useState<NotificationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    const res = await fetch("/api/notifications", { cache: "no-store" }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) {
      setRows([])
      setError(json?.error ?? "Failed to load notifications")
      setIsLoading(false)
      return
    }
    setRows((json?.notifications ?? []) as NotificationRow[])
    setIsLoading(false)
    window.dispatchEvent(new Event("learnify:notifications-updated"))
  }

  useEffect(() => {
    void load()
  }, [])

  const markRead = async (id: string) => {
    setBusy(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", id }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to mark as read")
      await load()
    } catch (e) {
      toast({ title: "Update failed", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusy(false)
    }
  }

  const markAllRead = async () => {
    setBusy(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to mark all as read")
      toast({ title: "All notifications marked as read" })
      await load()
    } catch (e) {
      toast({ title: "Update failed", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon" />
            <EmptyTitle>You’re all caught up</EmptyTitle>
            <EmptyDescription>No notifications right now.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const unread = rows.filter((n) => !n.readAt).length

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {unread > 0 ? `${unread} unread` : "All read"}
        </p>
        <Button variant="outline" size="sm" onClick={() => void markAllRead()} disabled={busy || unread === 0}>
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      <div className="divide-y divide-border">
        {rows.map((n) => {
          const when = new Date(n.createdAt).toLocaleString("en-ZW")
          const isUnread = !n.readAt
          return (
            <div key={n.id} className="px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={"text-sm font-medium " + (isUnread ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </p>
                    {isUnread ? (
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                    ) : null}
                  </div>
                  {n.body ? <p className="mt-1 text-sm text-muted-foreground">{n.body}</p> : null}
                  <p className="mt-2 text-xs text-muted-foreground">{when}</p>
                  {n.href ? (
                    <Link href={n.href} className="mt-2 inline-block text-sm text-accent hover:underline">
                      Open
                    </Link>
                  ) : null}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void markRead(n.id)}
                  disabled={busy || !isUnread}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark read
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
