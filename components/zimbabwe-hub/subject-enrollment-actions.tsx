"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function ZimbabweSubjectEnrollmentActions({
  packageId,
  initialStatus,
}: {
  packageId: string
  initialStatus: string | null
}) {
  const [status, setStatus] = useState<string | null>(initialStatus)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const act = async (action: "start" | "activate" | "cancel") => {
    setBusy(true)
    try {
      const res = await fetch(`/api/sa-hub/packages/${packageId}/enrollment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Request failed")
      setStatus(json?.enrollment?.status ?? status)
      window.location.reload()
    } catch (e) {
      toast({ title: "Action failed", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusy(false)
    }
  }

  if (status === "active") {
    return (
      <div className="space-y-2">
        <Button className="w-full" disabled>
          Active access
        </Button>
        <Button variant="outline" className="w-full" onClick={() => void act("cancel")} disabled={busy}>
          Cancel access
        </Button>
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className="space-y-2">
        <Button className="w-full" onClick={() => void act("activate")} disabled={busy}>
          Activate subscription (test payment)
        </Button>
        <Button variant="outline" className="w-full" onClick={() => void act("cancel")} disabled={busy}>
          Cancel
        </Button>
        <p className="text-xs text-muted-foreground">
          Payment provider is not integrated. Activate simulates a successful monthly payment.
        </p>
      </div>
    )
  }

  if (status === "cancelled") {
    return (
      <div className="space-y-2">
        <Button className="w-full" onClick={() => void act("start")} disabled={busy}>
          Re-enroll
        </Button>
        <p className="text-xs text-muted-foreground">Your access is currently cancelled.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={() => void act("start")} disabled={busy}>
        Start subscription
      </Button>
      <p className="text-xs text-muted-foreground">
        You&apos;ll be able to activate access after starting a subscription.
      </p>
    </div>
  )
}
