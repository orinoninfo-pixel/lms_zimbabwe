"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link.")
    }
  }, [token])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!token) {
      setError("Invalid reset link.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? "Reset failed")
        return
      }
      setMessage("Your password has been reset. Redirecting to login...")
      setTimeout(() => router.push("/login"), 1500)
    } catch {
      setError("Reset failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg border border-border space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Reset password</h2>
          <p className="text-sm text-muted-foreground">Enter a new password to finish resetting your account.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>New password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-foreground">{message}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
