import Link from "next/link"
import { AuthCard, AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"

export default function PasswordResetSuccessPage() {
  return (
    <AuthLayout
      title="Password updated"
      description="Your password has been reset successfully. Please sign in with your new password."
    >
      <AuthCard>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you did not make this change, contact support immediately at support@zimlearning.co.zw.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
