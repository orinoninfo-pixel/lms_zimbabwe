import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireRoleForPage } from "@/lib/rbac"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dynamic = "force-dynamic"

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export default async function BillingPage() {
  const auth = await requireRoleForPage("student")
  if (!auth) redirect("/")

  const subscription = await prisma.subscription.findUnique({ where: { userId: auth.user.id } })
  const invoices = await prisma.invoice.findMany({
    where: { userId: auth.user.id },
    orderBy: { issuedAt: "desc" },
    take: 50,
  })

  const planName = subscription?.planName ?? "Free"
  const status = subscription?.status ?? "active"

  const getStatusVariant = (value: string) => {
    if (value === "paid" || value === "succeeded" || value === "active") return "success" as const
    if (value === "pending") return "warning" as const
    if (value === "failed" || value === "void") return "destructive" as const
    return "secondary" as const
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
            <p className="text-sm text-muted-foreground">Subscription, payment method, and invoices</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Current plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold text-foreground">{planName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={getStatusVariant(status)}>{status}</Badge>
                </div>
                <div className="pt-2">
                  <Button variant="outline" disabled>
                    Manage plan
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Billing provider integration is not configured yet. This page shows a safe, database-backed structure.
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Payment method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">No payment method on file.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Add card/EFT method when payments are enabled.</p>
                </div>
                <Button variant="outline" disabled>
                  Add payment method
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice history</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">No invoices yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="text-foreground">
                            {inv.issuedAt.toLocaleDateString("en-ZW")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {inv.reference ?? inv.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-foreground">
                            {formatUsd(inv.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

