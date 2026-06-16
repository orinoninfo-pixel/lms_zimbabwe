import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"
import { InstructorSidebar } from "@/components/instructor/instructor-sidebar"
import { InstructorHeader } from "@/components/instructor/instructor-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function InstructorEarningsPage() {
  const auth = await requireRoleForPage("instructor")
  if (!auth) redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <InstructorSidebar />
      <div className="lg:pl-64">
        <InstructorHeader />
        <main className="p-4 lg:p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Earnings</h1>
              <p className="text-sm text-muted-foreground">Track revenue and payouts from your courses.</p>
            </div>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Earnings dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This area will show revenue summaries, payout history, and course-level earnings breakdowns.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

