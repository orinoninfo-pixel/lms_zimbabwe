import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Kind = "course" | "subject" | "user" | "application" | "report" | "transaction"

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
    if (v === "active") return "border border-success/35 bg-success/15 text-success"
    if (v === "suspended") return "border border-warning/35 bg-warning/18 text-warning-foreground"
    if (v === "banned") return "border border-destructive/35 bg-destructive/15 text-destructive"
  }
  if (kind === "course" || kind === "subject") {
    if (v === "approved") return "border border-success/35 bg-success/15 text-success"
    if (v === "pending") return "border border-warning/35 bg-warning/18 text-warning-foreground"
    if (v === "rejected") return "border border-destructive/35 bg-destructive/15 text-destructive"
    if (v === "suspended") return "border border-destructive/35 bg-destructive/15 text-destructive"
    if (v === "draft") return "bg-muted text-muted-foreground"
  }
  if (kind === "application") {
    if (v === "approved") return "border border-success/35 bg-success/15 text-success"
    if (v === "pending") return "border border-warning/35 bg-warning/18 text-warning-foreground"
    if (v === "rejected") return "border border-destructive/35 bg-destructive/15 text-destructive"
  }
  if (kind === "report") {
    if (v === "open") return "border border-destructive/35 bg-destructive/15 text-destructive"
    if (v === "reviewing") return "border border-warning/35 bg-warning/18 text-warning-foreground"
    if (v === "resolved") return "border border-success/35 bg-success/15 text-success"
    if (v === "dismissed") return "bg-muted text-muted-foreground"
  }
  if (kind === "transaction") {
    if (v === "succeeded") return "border border-success/35 bg-success/15 text-success"
    if (v === "pending") return "border border-warning/35 bg-warning/18 text-warning-foreground"
    if (v === "failed") return "border border-destructive/35 bg-destructive/15 text-destructive"
    if (v === "reversed") return "bg-muted text-muted-foreground"
  }
  return "bg-muted text-muted-foreground"
}

