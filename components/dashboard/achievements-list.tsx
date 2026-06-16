"use client"

import { useEffect, useState } from "react"
import { Award, Heart, Trophy, Zap } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type AchievementRow = {
  id: string
  code: string
  name: string
  description: string
  icon: string | null
  earnedAt: string | null
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  heart: Heart,
  zap: Zap,
  award: Award,
}

export function AchievementsList() {
  const [earned, setEarned] = useState<AchievementRow[]>([])
  const [locked, setLocked] = useState<AchievementRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/achievements", { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (cancelled) return
      if (!res || !res.ok) {
        setError(json?.error ?? "Failed to load achievements")
        setEarned([])
        setLocked([])
        setIsLoading(false)
        return
      }
      setEarned((json?.earned ?? []) as AchievementRow[])
      setLocked((json?.locked ?? []) as AchievementRow[])
      setIsLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Loading achievements...</p>
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

  if (earned.length === 0 && locked.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon" />
            <EmptyTitle>No achievements yet</EmptyTitle>
            <EmptyDescription>Start learning to unlock achievements.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      </div>
    )
  }

  const renderCard = (a: AchievementRow, isLocked: boolean) => {
    const Icon = a.icon ? iconMap[a.icon] ?? Trophy : Trophy
    const earnedAt = a.earnedAt ? new Date(a.earnedAt).toLocaleDateString("en-ZW") : null
    return (
      <div
        key={a.id}
        className={
          "rounded-xl border border-border bg-card p-5 shadow-sm " +
          (isLocked ? "opacity-60" : "hover:shadow-md transition-shadow")
        }
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/40 text-accent-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-foreground truncate">{a.name}</p>
              {earnedAt ? (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Earned {earnedAt}
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  Locked
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Earned</h2>
        {earned.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">No earned achievements yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {earned.map((a) => renderCard(a, false))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Locked</h2>
        {locked.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">You’ve unlocked everything available.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {locked.map((a) => renderCard(a, true))}
          </div>
        )}
      </div>
    </div>
  )
}
