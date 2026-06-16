import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireRoleForPage } from "@/lib/rbac"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function CertificateViewPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRoleForPage("student")
  if (!auth) redirect("/")

  const { id } = await params
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { course: { select: { id: true, title: true } } },
  })
  if (!cert || cert.userId !== auth.user.id) notFound()

  const issuedAt = cert.issuedAt.toLocaleDateString("en-ZW", { year: "numeric", month: "long", day: "2-digit" })

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 lg:p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Certificate</h1>
              <p className="text-sm text-muted-foreground">Certificate details and download</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a href={`/api/certificates/${cert.id}/download`}>Download</a>
              </Button>
              <Button asChild>
                <Link href="/dashboard/certificates">Back</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Zim Learning Certificate of Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Course</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{cert.course.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{cert.course.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Learner</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{auth.user.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{auth.user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completion date</p>
                  <p className="mt-1 text-sm text-foreground">{issuedAt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Certificate ID</p>
                  <p className="mt-1 text-sm text-foreground">{cert.certificateId}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  This certificate confirms that the learner has successfully completed the course on Zim Learning.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
