import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { PaymentStatusPanel } from "@/components/payments/payment-status-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

type SearchParams = {
  reference?: string | string[]
  itemType?: string | string[]
  itemId?: string | string[]
}

function getFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const reference = getFirst(params.reference)
  const itemType = getFirst(params.itemType)
  const itemId = getFirst(params.itemId)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="border-b border-border bg-muted/20">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 md:py-14">
            <p className="text-sm font-medium text-accent">Payment Status</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Check your Paynow payment result
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              This page confirms whether your payment has been completed, is still pending, or needs another attempt.
            </p>
          </div>
        </section>

        <section className="py-8 md:py-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {reference ? (
              <PaymentStatusPanel
                reference={reference}
                itemType={itemType === "course" || itemType === "training" ? itemType : undefined}
                itemId={itemId}
              />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Missing payment reference</AlertTitle>
                  <AlertDescription>
                    We could not determine which payment to check. Return to the course or billing page and try again.
                  </AlertDescription>
                </Alert>
                <div className="mt-4 flex gap-3">
                  <Button asChild>
                    <Link href="/dashboard/billing">Open Billing</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/">Go Home</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
