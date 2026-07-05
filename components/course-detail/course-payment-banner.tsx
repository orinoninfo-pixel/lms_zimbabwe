import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function CoursePaymentBanner({
  courseId,
  reference,
}: {
  courseId: string
  reference?: string
}) {
  return (
    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Payment confirmed</AlertTitle>
      <AlertDescription>
        <p>Your Paynow payment was confirmed and this course is now unlocked.</p>
        {reference ? <p>Reference: {reference}</p> : null}
        <div className="mt-3 flex flex-wrap gap-3">
          <Button asChild size="sm">
            <Link href={`/learn/${courseId}`}>Start Learning</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/billing">View Billing</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
