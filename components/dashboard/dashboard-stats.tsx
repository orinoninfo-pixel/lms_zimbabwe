import { BookOpen, Clock, Trophy, Target } from "lucide-react"

const stats = [
  {
    name: "Enrolled Courses",
    value: "4",
    change: "+1 this month",
    icon: BookOpen,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    name: "Hours Learned",
    value: "47.5",
    change: "+8.2 this week",
    icon: Clock,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    name: "Certificates",
    value: "2",
    change: "1 in progress",
    icon: Trophy,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    name: "Completion Rate",
    value: "72%",
    change: "+5% vs last month",
    icon: Target,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-lg border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
            </div>
            <div className={`rounded-md p-2.5 ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
