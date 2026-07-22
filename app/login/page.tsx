"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg border border-border space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Log in</h2>
          <p className="text-sm text-muted-foreground">Use your email and password to continue.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/forgot-password" className="underline">Forgot password?</Link>
            <Link href="/register" className="underline">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
