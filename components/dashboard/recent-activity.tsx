import { CheckCircle2, Play, Trophy } from "lucide-react"
import { getStudentRecentActivity } from "@/lib/dashboard-activity"

const ACTIVITY_ICON = {
  completed: { icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-600" },
  enrolled: { icon: Play, bg: "bg-blue-100", color: "text-blue-600" },
  achievement: { icon: Trophy, bg: "bg-amber-100", color: "text-amber-600" },
} as const

function formatRelativeTime(value: Date) {
  const diffMs = Date.now() - value.getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`
  return value.toLocaleDateString("en-ZW", { month: "short", day: "numeric", year: "numeric" })
}

export async function RecentActivity({ userId }: { userId: string }) {
  const activities = await getStudentRecentActivity(userId)

  return (
    <div className="rounded-lg border border-border bg-card shadow-xs">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      </div>
      {activities.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">
          No activity yet. Enrol in a course and complete a lesson to see it here.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const { icon: Icon, bg, color } = ACTIVITY_ICON[activity.type]
            return (
              <div key={activity.id} className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/20">
                <div className={`rounded-md p-2 ${bg} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatRelativeTime(activity.time)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
