import Link from "next/link"
import { AuthCard, AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"

export default function ResetPasswordInvalidPage() {
  return (
    <AuthLayout
      title="Reset link unavailable"
      description="This password reset link is invalid, expired, or has already been used."
    >
      <AuthCard>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Request a new reset link to continue securing your account.
          </p>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
              Back to login
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
