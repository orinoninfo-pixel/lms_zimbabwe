import { AdminInstructorsTable } from "@/components/admin/admin-instructors-table"

export default function AdminInstructorsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Faculty Controls</p>
            <h1 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">Instructor Oversight</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage instructor accounts, monitor delivery quality, and coordinate payout readiness.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            Teaching Workforce
          </div>
        </div>
      </section>

      <AdminInstructorsTable />
    </div>
  )
}
