import { AdminSubjectsTable } from "@/components/admin/admin-subjects-table"

export default function AdminSubjectsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Subject Compliance</p>
            <h1 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">Subject Moderation Hub</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Approve, reject, suspend, and remove subject packages to keep academic quality consistent.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            Curriculum Review
          </div>
        </div>
      </section>

      <AdminSubjectsTable />
    </div>
  )
}
