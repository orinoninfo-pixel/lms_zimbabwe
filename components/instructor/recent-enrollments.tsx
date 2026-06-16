import { Clock } from "lucide-react"

const enrollments = [
  {
    id: 1,
    student: "Alex Johnson",
    initials: "AJ",
    course: "Complete React Developer Course",
    time: "5 minutes ago",
    amount: 89.99,
  },
  {
    id: 2,
    student: "Maria Garcia",
    initials: "MG",
    course: "Advanced TypeScript Masterclass",
    time: "23 minutes ago",
    amount: 99.99,
  },
  {
    id: 3,
    student: "James Chen",
    initials: "JC",
    course: "Node.js Backend Development",
    time: "1 hour ago",
    amount: 79.99,
  },
  {
    id: 4,
    student: "Emma Wilson",
    initials: "EW",
    course: "Complete React Developer Course",
    time: "2 hours ago",
    amount: 89.99,
  },
  {
    id: 5,
    student: "David Kim",
    initials: "DK",
    course: "GraphQL API Design",
    time: "3 hours ago",
    amount: 69.99,
  },
]

export function RecentEnrollments() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Enrollments</h2>
        <p className="text-sm text-muted-foreground">Latest students who enrolled in your courses</p>
      </div>
      <div className="divide-y divide-border">
        {enrollments.map((enrollment) => (
          <div key={enrollment.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/50 text-accent-foreground text-sm font-semibold flex-shrink-0">
              {enrollment.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{enrollment.student}</p>
              <p className="text-xs text-muted-foreground truncate">{enrollment.course}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-medium text-emerald-600">+${enrollment.amount}</p>
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {enrollment.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <button className="w-full text-center text-sm font-medium text-primary hover:underline">
          View all enrollments
        </button>
      </div>
    </div>
  )
}
