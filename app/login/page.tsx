"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { AuthCard, AuthLayout } from "@/components/auth/auth-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email")
      return
    }
    if (!password) {
      setError("Please enter your password")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => null)
      if (data?.requiresPasswordChange && data?.resetToken) {
        const next = searchParams.get("next")
        const params = new URLSearchParams({
          token: data.resetToken as string,
          required: "1",
        })
        if (next) params.set("next", next)
        router.push(`/reset-password?${params.toString()}`)
        return
      }
      if (!res.ok) {
        setError(data?.error ?? "Login failed")
        return
      }

      const actualRole = data?.user?.role as "student" | "instructor" | "admin" | "internal_instructor" | undefined
      const next = searchParams.get("next")
      if (next) {
        router.push(next)
        return
      }

      router.push(
        actualRole === "admin"
          ? "/admin"
          : actualRole === "internal_instructor"
          ? "/internal-instructor"
          : actualRole === "instructor"
          ? "/instructor"
          : "/dashboard"
      )
    } catch {
      setError("Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Log in" description="Use your email and password to continue learning.">
      <AuthCard>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/forgot-password" className="underline underline-offset-4 hover:text-foreground">
              Forgot password?
            </Link>
            <Link href="/register" className="underline underline-offset-4 hover:text-foreground">
              Create account
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Log in" description="Loading your secure sign-in form.">
          <AuthCard>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </AuthCard>
        </AuthLayout>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
