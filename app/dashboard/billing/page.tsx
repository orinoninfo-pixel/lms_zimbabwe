import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireRoleForPage } from "@/lib/rbac"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

const formatZar = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount)

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
                <p className="text-sm text-muted-foreground">Status: {status}</p>
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Reference
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                              {inv.issuedAt.toLocaleDateString("en-ZA")}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {inv.reference ?? inv.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">{inv.status}</td>
                            <td className="px-4 py-3 text-sm text-foreground text-right tabular-nums whitespace-nowrap">
                              {formatZar(inv.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

