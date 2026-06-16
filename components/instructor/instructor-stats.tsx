import { Users, DollarSign, BookOpen, Star, TrendingUp, Eye } from "lucide-react"

const stats = [
  {
    name: "Total Students",
    value: "1,234",
    change: "+12% this month",
    trend: "up",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    name: "Total Earnings",
    value: "$12,450",
    change: "+8% this month",
    trend: "up",
    icon: DollarSign,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    name: "Active Courses",
    value: "6",
    change: "2 drafts pending",
    trend: "neutral",
    icon: BookOpen,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    name: "Average Rating",
    value: "4.8",
    change: "From 856 reviews",
    trend: "up",
    icon: Star,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
]

const secondaryStats = [
  {
    name: "Course Views",
    value: "24,521",
    change: "+18%",
    icon: Eye,
  },
  {
    name: "Conversion Rate",
    value: "5.2%",
    change: "+0.8%",
    icon: TrendingUp,
  },
]

export function InstructorStats() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-card rounded-xl border border-border p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className={`mt-1 text-xs ${stat.trend === "up" ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {secondaryStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4"
          >
            <div className="rounded-lg bg-muted p-2.5">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
            </div>
            <span className="text-sm font-medium text-emerald-600">{stat.change}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
