import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Kind = "course" | "user" | "application" | "report" | "transaction"

export function StatusBadge({
  kind,
  value,
}: {
  kind: Kind
  value: string
}) {
  const classes = getStatusClasses(kind, value)
  return <Badge className={cn("capitalize", classes)}>{value.replace(/_/g, " ")}</Badge>
}

function getStatusClasses(kind: Kind, value: string) {
  const v = value.toLowerCase()
  if (kind === "user") {
    if (v === "active") return "bg-emerald-100 text-emerald-700"
    if (v === "suspended") return "bg-amber-100 text-amber-800"
    if (v === "banned") return "bg-rose-100 text-rose-700"
  }
  if (kind === "course") {
    if (v === "approved") return "bg-emerald-100 text-emerald-700"
    if (v === "pending") return "bg-amber-100 text-amber-800"
    if (v === "rejected") return "bg-rose-100 text-rose-700"
    if (v === "suspended") return "bg-rose-100 text-rose-700"
    if (v === "draft") return "bg-muted text-muted-foreground"
  }
  if (kind === "application") {
    if (v === "approved") return "bg-emerald-100 text-emerald-700"
    if (v === "pending") return "bg-amber-100 text-amber-800"
    if (v === "rejected") return "bg-rose-100 text-rose-700"
  }
  if (kind === "report") {
    if (v === "open") return "bg-rose-100 text-rose-700"
    if (v === "reviewing") return "bg-amber-100 text-amber-800"
    if (v === "resolved") return "bg-emerald-100 text-emerald-700"
    if (v === "dismissed") return "bg-muted text-muted-foreground"
  }
  if (kind === "transaction") {
    if (v === "succeeded") return "bg-emerald-100 text-emerald-700"
    if (v === "pending") return "bg-amber-100 text-amber-800"
    if (v === "failed") return "bg-rose-100 text-rose-700"
    if (v === "reversed") return "bg-muted text-muted-foreground"
  }
  return "bg-muted text-muted-foreground"
}

