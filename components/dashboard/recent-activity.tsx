import { CheckCircle2, Play, Trophy, BookOpen } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "completed",
    title: "Completed: Introduction to CSS Grid",
    course: "Complete Web Development Bootcamp",
    time: "2 hours ago",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: 2,
    type: "started",
    title: "Started: Building REST APIs",
    course: "Complete Web Development Bootcamp",
    time: "3 hours ago",
    icon: Play,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 3,
    type: "achievement",
    title: "Earned: 7-Day Streak Badge",
    course: "Achievement Unlocked",
    time: "1 day ago",
    icon: Trophy,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: 4,
    type: "enrolled",
    title: "Enrolled in: Data Science with Python",
    course: "New Course Added",
    time: "2 days ago",
    icon: BookOpen,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    id: 5,
    type: "completed",
    title: "Completed: User Research Methods",
    course: "UI/UX Design Masterclass",
    time: "3 days ago",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
]

export function RecentActivity() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-4">
            <div className={`rounded-lg p-2 ${activity.iconBg} flex-shrink-0`}>
              <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.course}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
