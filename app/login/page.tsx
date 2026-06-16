"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role")
  const initialRole =
    roleParam === "admin" ? "admin" : roleParam === "instructor" ? "instructor" : "student"
  const [role, setRole] = useState<"student" | "instructor" | "admin">(initialRole)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? "Login failed")
        return
      }
      const actualRole = (data?.user?.role as "student" | "instructor" | "admin" | undefined) ?? undefined

      if (role === "admin" && actualRole !== "admin") {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
        setError("This account is not an admin.")
        return
      }

      if (role === "instructor" && actualRole !== "instructor") {
        const status = data?.instructorApplicationStatus as string | null | undefined
        if (status === "pending") {
          setError("Your instructor application is pending approval. You can use the student dashboard for now.")
        } else {
          setError("This account is not an instructor.")
        }
      }

      const next = searchParams.get("next")
      if (next) {
        router.push(next)
        return
      }

      router.push(actualRole === "admin" ? "/admin" : actualRole === "instructor" ? "/instructor" : "/dashboard")
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
          <p className="text-sm text-muted-foreground">
            Enter your email to continue.
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              type="button"
              variant={role === "student" ? "default" : "outline"}
              onClick={() => setRole("student")}
            >
              Student
            </Button>
            <Button
              type="button"
              variant={role === "instructor" ? "default" : "outline"}
              onClick={() => setRole("instructor")}
            >
              Instructor
            </Button>
            <Button
              type="button"
              variant={role === "admin" ? "default" : "outline"}
              onClick={() => setRole("admin")}
            >
              Admin
            </Button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Signing in..."
                : role === "admin"
                  ? "Continue as Admin"
                  : role === "instructor"
                    ? "Continue as Instructor"
                    : "Continue as Student"}
            </Button>
          </form>
        </div>
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
