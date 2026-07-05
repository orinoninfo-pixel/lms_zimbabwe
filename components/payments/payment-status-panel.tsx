"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Clock3, RefreshCcw, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

type PaymentStatusResponse = {
  reference: string | null
  status: "pending" | "succeeded" | "failed" | "reversed"
  type: string
  amount: number
  currency: "USD" | "ZWL" | "ZAR"
  description: string | null
  createdAt: string
  itemType: "course" | "training"
  itemId: string | null
  hasCourseAccess: boolean
}

function formatMoney(amount: number, currency: PaymentStatusResponse["currency"]) {
  return new Intl.NumberFormat("en-ZW", { style: "currency", currency }).format(amount)
}

function withPaymentContext(path: string, reference: string) {
  const params = new URLSearchParams({ payment: "confirmed", reference })
  return `${path}?${params.toString()}`
}

export function PaymentStatusPanel({
  reference,
  itemType,
  itemId,
}: {
  reference: string
  itemType?: "course" | "training"
  itemId?: string
}) {
  const [data, setData] = useState<PaymentStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true)
      else setIsLoading(true)

      try {
        const params = new URLSearchParams({ reference })
        if (itemType) params.set("itemType", itemType)
        if (itemId) params.set("itemId", itemId)

        const res = await fetch(`/api/payments/status?${params.toString()}`, { cache: "no-store" })
        const json = await res.json().catch(() => null)
        if (!res.ok) throw new Error(json?.error ?? "Failed to load payment status")
        setData(json as PaymentStatusResponse)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load payment status")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [reference, itemId, itemType]
  )

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (data?.status !== "pending") return
    const timer = window.setTimeout(() => {
      void load(true)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [data?.status, load])

  const statusMeta = useMemo(() => {
    if (!data) return null

    if (data.status === "succeeded") {
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
        title: "Payment confirmed",
        description:
          data.itemType === "course"
            ? "Your payment has been confirmed and your course is ready."
            : "Your payment has been confirmed. Your training access details are now available.",
        badgeClass: "bg-emerald-600 text-white hover:bg-emerald-600",
      }
    }

    if (data.status === "failed") {
      return {
        icon: <XCircle className="h-5 w-5 text-destructive" />,
        title: "Payment failed",
        description: "Paynow did not confirm this payment. You can return to the item and try again.",
        badgeClass: "bg-destructive text-white hover:bg-destructive",
      }
    }

    if (data.status === "reversed") {
      return {
        icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
        title: "Payment reversed",
        description: "This payment was reversed. Please start a new payment if you still want access.",
        badgeClass: "bg-amber-500 text-white hover:bg-amber-500",
      }
    }

    return {
      icon: <Clock3 className="h-5 w-5 text-blue-600" />,
      title: "Payment pending",
      description: "We are still waiting for Paynow to confirm your payment. This page refreshes automatically.",
      badgeClass: "bg-blue-600 text-white hover:bg-blue-600",
    }
  }, [data])

  const primaryAction = useMemo(() => {
    if (!data) return null

    if (data.status === "succeeded" && data.itemType === "course" && data.itemId && data.hasCourseAccess) {
      return { href: `/learn/${data.itemId}`, label: "Open Course" }
    }

    if (data.status === "succeeded" && data.itemType === "training" && data.itemId) {
      return { href: `/zimbabwe-learning-hub/${data.itemId}`, label: "Open Training" }
    }

    if (data.itemType === "course" && data.itemId) {
      return { href: `/course/${data.itemId}`, label: data.status === "pending" ? "Back to Course" : "Try Again" }
    }

    if (data.itemType === "training" && data.itemId) {
      return {
        href: `/zimbabwe-learning-hub/${data.itemId}`,
        label: data.status === "pending" ? "Back to Training" : "Try Again",
      }
    }

    return null
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner className="size-5" />
            <span>Checking payment status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load payment status</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => void load(true)} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button asChild>
              <Link href="/dashboard/billing">Go to Billing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !statusMeta) return null

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {statusMeta.icon}
            <div>
              <CardTitle>{statusMeta.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{statusMeta.description}</p>
            </div>
          </div>
          <Badge className={statusMeta.badgeClass}>{data.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reference</p>
            <p className="mt-1 text-sm font-medium text-foreground">{data.reference}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</p>
            <p className="mt-1 text-sm font-medium text-foreground">{formatMoney(data.amount, data.currency)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Item</p>
            <p className="mt-1 text-sm font-medium text-foreground">{data.description ?? "Payment"}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Started</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {new Date(data.createdAt).toLocaleString("en-ZW")}
            </p>
          </div>
        </div>

        {data.status === "pending" ? (
          <Alert>
            <Clock3 className="h-4 w-4" />
            <AlertTitle>Still waiting for confirmation</AlertTitle>
            <AlertDescription>
              Keep this page open for a moment or refresh manually if you have already completed the Paynow step.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {primaryAction ? (
            <Button asChild>
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
          ) : null}
          {data.status === "succeeded" && data.itemType === "course" && data.itemId ? (
            <Button asChild variant="outline">
              <Link href={withPaymentContext(`/course/${data.itemId}`, data.reference ?? reference)}>Back to Course</Link>
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => void load(true)} disabled={isRefreshing}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isRefreshing ? "Refreshing..." : "Refresh Status"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/billing">Open Billing</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
