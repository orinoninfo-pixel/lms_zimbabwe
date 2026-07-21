"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { HeartOff, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { toast } from "@/hooks/use-toast"
import { THUMBNAIL_BLUR_DATA_URL } from "@/lib/utils"

type WishlistCourse = {
  id: string
  title: string
  description: string
  price: number
  instructorName: string
  thumbnail: string
  favoritedAt: string
  enrolled: boolean
}

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export function WishlistList() {
  const [courses, setCourses] = useState<WishlistCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    const res = await fetch("/api/favorites", { cache: "no-store" }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) {
      setCourses([])
      setError(json?.error ?? "Failed to load wishlist")
      setIsLoading(false)
      return
    }
    setCourses((json?.courses ?? []) as WishlistCourse[])
    setIsLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await load()
      if (cancelled) return
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleWishlist = async (courseId: string) => {
    setBusyId(courseId)
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to update wishlist")
      toast({ title: "Removed from wishlist" })
      await load()
    } catch (e) {
      toast({ title: "Wishlist update failed", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  const startCheckout = async (courseId: string) => {
    setBusyId(courseId)
    try {
      const res = await fetch("/api/checkout/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "course", itemId: courseId }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to prepare payment")
      if (json?.checkout?.redirectUrl) {
        window.location.assign(json.checkout.redirectUrl)
        return
      }
      if (json?.alreadyEnrolled) {
        toast({ title: "Course already unlocked" })
        await load()
        return
      }
      toast({
        title: "Checkout prepared",
        description: json?.checkout?.message ?? "Paynow checkout is ready for payment.",
      })
    } catch (e) {
      toast({ title: "Payment failed", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Loading wishlist...</p>
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

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon" />
            <EmptyTitle>Your wishlist is empty</EmptyTitle>
            <EmptyDescription>Save courses to come back to them later.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {courses.map((course) => {
        const busy = busyId === course.id
        return (
          <article
            key={course.id}
            className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={THUMBNAIL_BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground line-clamp-1">{course.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">by {course.instructorName}</p>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{course.description}</p>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{formatUsd(course.price)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void toggleWishlist(course.id)}
                  disabled={busy}
                >
                  <HeartOff className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/course/${course.id}`}>Open</Link>
                </Button>
                {course.enrolled ? (
                  <Button asChild size="sm">
                    <Link href={`/learn/${course.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Continue
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => void startCheckout(course.id)} disabled={busy}>
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
