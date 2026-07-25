import Link from "next/link"
import { AuthCard, AuthLayout } from "@/components/auth/auth-layout"

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify your email"
      description="Check your inbox for a verification link to finish setting up your Zim Learning account."
    >
      <AuthCard>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            We sent a verification message to your email address. Open the email and click the verification link to continue.
          </p>
          <p>
            Did not get it? Check your spam folder or return to{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-foreground">
              registration
            </Link>
            .
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
