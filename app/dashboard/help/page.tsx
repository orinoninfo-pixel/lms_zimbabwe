import Link from "next/link"
import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function HelpCenterPage() {
  const auth = await requireRoleForPage("student")
  if (!auth) redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Help Center</h1>
            <p className="text-sm text-muted-foreground">Find answers and get support</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Frequently asked questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium text-foreground">How do I enroll in a course?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Open a course page and click Enroll. Your enrolled courses appear in My Courses.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium text-foreground">Where can I find my certificates?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Go to Certificates in the sidebar. Certificates appear once you complete all lessons in a course.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium text-foreground">How does my progress update?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Progress updates as you complete lessons. You can continue from My Courses.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium text-foreground">I’m not receiving notifications</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check Notifications in your dashboard. Unread notifications show a badge in the header and sidebar.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Contact support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    Need help with billing, access, or a course issue? Contact support and include your email address.
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">support@learnify.co.za</p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/notifications">View notifications</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">Back to dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

