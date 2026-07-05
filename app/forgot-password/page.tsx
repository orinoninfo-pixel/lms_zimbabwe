"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? "Request failed")
        return
      }
      setMessage("If an account exists for that email, we sent reset instructions.")
    } catch {
      setError("Request failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg border border-border space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Forgot password</h2>
          <p className="text-sm text-muted-foreground">Enter your email and we will send password reset instructions.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-foreground">{message}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Send reset link"}
          </Button>
          <div className="text-sm text-muted-foreground">
            <Link href="/login" className="underline">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
