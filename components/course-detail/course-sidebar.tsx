"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PlayCircle, FileText, Award, Download, RefreshCcw, Smartphone, Share2, Gift, TicketPercent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CourseSidebarProps {
  courseId: string
  price: number
  originalPrice: number
  discount: number
  features: {
    videoHours: string
    articles: number
    resources: number
    certificate: boolean
    lifetime: boolean
    mobile: boolean
  }
}

export function CourseSidebar({ courseId, price, originalPrice, discount, features }: CourseSidebarProps) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch(`/api/courses/${courseId}/me`, { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (cancelled) return
      setLoggedIn(Boolean(json?.loggedIn))
      setIsEnrolled(Boolean(json?.enrolled))
      setIsFavorited(Boolean(json?.favorited))
    }
    load()
    return () => {
      cancelled = true
    }
  }, [courseId])

  const handleEnroll = async () => {
    setIsEnrolling(true)
    setEnrollError(null)
    try {
      if (!loggedIn) {
        router.push(`/login?next=${encodeURIComponent(`/course/${courseId}`)}`)
        return
      }

      const res = await fetch("/api/checkout/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "course", itemId: courseId }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent(`/course/${courseId}`)}`)
          return
        }
        const message = data?.error ?? "Failed to prepare payment"
        setEnrollError(message)
        return
      }

      if (data?.checkout?.redirectUrl) {
        window.location.assign(data.checkout.redirectUrl)
        return
      }

      if (data?.alreadyEnrolled || data?.enrolledFree) {
        setIsEnrolled(true)
        router.push(`/learn/${courseId}`)
        return
      }

      if (data?.checkout?.configured) {
        setEnrollError(data.checkout.message)
      } else {
        setEnrollError(data?.checkout?.message ?? "Checkout is ready for payment")
      }
    } catch {
      setEnrollError("Failed to prepare payment")
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true)
    try {
      if (!loggedIn) {
        router.push(`/login?next=${encodeURIComponent(`/course/${courseId}`)}`)
        return
      }
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent(`/course/${courseId}`)}`)
          return
        }
        return
      }
      setIsFavorited(Boolean(data?.favorited))
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  return (
    <Card className="sticky top-24 shadow-lg border-border">
      <CardContent className="p-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-4xl font-bold text-foreground">${price}</span>
          <span className="text-lg text-muted-foreground line-through">${originalPrice}</span>
          <span className="text-sm font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
            {discount}% off
          </span>
        </div>
        <p className="text-sm text-destructive font-medium mb-6">
          Sale ends in 2 days!
        </p>

        <div className="space-y-3 mb-6">
          {isEnrolled ? (
            <Button asChild className="w-full" size="lg">
              <Link href={`/learn/${courseId}`}>Open Course</Link>
            </Button>
          ) : (
            <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isEnrolling}>
              {price === 0
                ? isEnrolling
                  ? "Enrolling..."
                  : "Enroll for Free"
                : isEnrolling
                ? "Preparing Paynow..."
                : "Pay with Paynow"}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
          >
            {isFavorited ? "Saved" : isTogglingFavorite ? "Saving..." : "Add to Wishlist"}
          </Button>
        </div>
        {enrollError && <p className="text-sm text-destructive mb-4">{enrollError}</p>}

        <p className="text-center text-sm text-muted-foreground mb-6">
          30-Day Money-Back Guarantee
        </p>

        <div className="border-t border-border pt-6">
          <h4 className="font-semibold text-foreground mb-4">This course includes:</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-muted-foreground">
              <PlayCircle className="h-5 w-5 text-foreground" />
              <span>{features.videoHours} of video content</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileText className="h-5 w-5 text-foreground" />
              <span>{features.articles} articles</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-muted-foreground">
              <Download className="h-5 w-5 text-foreground" />
              <span>{features.resources} downloadable resources</span>
            </li>
            {features.certificate && (
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Award className="h-5 w-5 text-foreground" />
                <span>Certificate of completion</span>
              </li>
            )}
            {features.lifetime && (
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <RefreshCcw className="h-5 w-5 text-foreground" />
                <span>Full lifetime access</span>
              </li>
            )}
            {features.mobile && (
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Smartphone className="h-5 w-5 text-foreground" />
                <span>Access on mobile and TV</span>
              </li>
            )}
          </ul>
        </div>

        <div className="border-t border-border mt-6 pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card">
              <Share2 className="h-4 w-4 shrink-0" />
              <span>Share</span>
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card">
              <Gift className="h-4 w-4 shrink-0" />
              <span>Gift this course</span>
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card">
              <TicketPercent className="h-4 w-4 shrink-0" />
              <span>Apply Coupon</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
