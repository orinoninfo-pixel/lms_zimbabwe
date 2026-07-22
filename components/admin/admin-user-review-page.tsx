"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, CheckCircle2, Copy, KeyRound, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/admin/status-badge"
import { toast } from "@/hooks/use-toast"

type ReviewUser = {
  id: string
  name: string
  email: string
  role: "student" | "instructor" | "admin" | "internal_instructor"
  status: "active" | "suspended" | "banned"
  mustChangePassword: boolean
  hasPassword: boolean
  createdAt: string
  updatedAt: string
  instructorApplication: {
    id: string
    status: "pending" | "approved" | "rejected"
    createdAt: string
    reviewedAt: string | null
  } | null
  courses: Array<{
    id: string
    title: string
    status: "draft" | "pending" | "approved" | "rejected" | "suspended"
    price: number
    createdAt: string
  }>
  enrollments: Array<{
    id: string
    createdAt: string
    course: {
      id: string
      title: string
      status: "draft" | "pending" | "approved" | "rejected" | "suspended"
      price: number
    }
  }>
  _count: {
    courses: number
    enrollments: number
    reportsMade: number
    reportsAgainst: number
    certificates: number
  }
}

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-ZW", { style: "currency", currency: "USD" }).format(amount)

export function AdminUserReviewPage({ userId }: { userId: string }) {
  const router = useRouter()
  const [user, setUser] = useState<ReviewUser | null>(null)
  const [role, setRole] = useState<ReviewUser["role"]>("student")
  const [status, setStatus] = useState<ReviewUser["status"]>("active")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  const accountReadiness = useMemo(
    () => [
      { label: "Password is set", ok: Boolean(user?.hasPassword) },
      { label: "User is active", ok: user?.status === "active" },
      { label: "Temporary password has been changed", ok: !user?.mustChangePassword },
    ],
    [user]
  )
  const accountReady = accountReadiness.every((item) => item.ok)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/admin/users/${userId}`, { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null

      if (cancelled) return

      if (!res || !res.ok) {
        setUser(null)
        setError(json?.error ?? "Failed to load user details")
        setIsLoading(false)
        return
      }

      const nextUser = json?.user as ReviewUser
      setUser(nextUser)
      setRole(nextUser.role)
      setStatus(nextUser.status)
      setIsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const save = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          status,
        }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to save user")

      const updated = json?.user as ReviewUser
      setUser(updated)
      setRole(updated.role)
      setStatus(updated.status)
      toast({ title: "User details saved" })
    } catch (e) {
      toast({ title: "Failed to save user", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setIsSaving(false)
    }
  }

  const resetPassword = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPassword" }),
      }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Failed to reset password")

      const updated = json?.user as ReviewUser
      setUser(updated)
      setRole(updated.role)
      setStatus(updated.status)
      setTemporaryPassword((json?.temporaryPassword as string) ?? null)
      toast({ title: "Temporary password generated" })
    } catch (e) {
      toast({ title: "Failed to reset password", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setIsSaving(false)
    }
  }

  const copyTemporaryPassword = async () => {
    if (!temporaryPassword) return

    try {
      await navigator.clipboard.writeText(temporaryPassword)
      toast({ title: "Temporary password copied" })
    } catch {
      toast({ title: "Could not copy password", description: "Copy it manually from the panel." })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="h-auto px-0 text-muted-foreground">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to users
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review User</h1>
            <p className="text-sm text-muted-foreground">
              Review account details, adjust role and access, and issue a temporary password reset.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void save()} disabled={isSaving || !user}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={() => void resetPassword()} disabled={isSaving || !user}>
            <KeyRound className="mr-2 h-4 w-4" />
            Reset Password
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Loading user details...</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {user ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
              <p className="mt-2 text-sm font-medium text-foreground capitalize">{user.role}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusBadge kind="user" value={user.status} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Enrollments</p>
              <p className="mt-2 text-sm font-medium text-foreground">{user._count.enrollments}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Courses Created</p>
              <p className="mt-2 text-sm font-medium text-foreground">{user._count.courses}</p>
            </div>
          </div>

          {temporaryPassword ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-950 [&>svg]:text-amber-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Share this temporary password securely</AlertTitle>
              <AlertDescription>
                <p>The user must change this password before they can complete sign-in.</p>
                <div className="mt-2 flex flex-col gap-2 rounded-md border border-amber-200 bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="text-sm font-semibold text-foreground">{temporaryPassword}</code>
                  <Button type="button" variant="outline" size="sm" onClick={() => void copyTemporaryPassword()}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_380px]">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">User Details</h2>
                  <p className="text-sm text-muted-foreground">Review the account identity and platform activity.</p>
                </div>
                <dl className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full name</dt>
                    <dd className="text-sm text-foreground">{user.name}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
                    <dd className="text-sm text-foreground">{user.email}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Joined</dt>
                    <dd className="text-sm text-foreground">{new Date(user.createdAt).toLocaleString("en-ZW")}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last updated</dt>
                    <dd className="text-sm text-foreground">{new Date(user.updatedAt).toLocaleString("en-ZW")}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      {accountReady ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <p className="text-sm font-semibold text-foreground">Access Readiness</p>
                    </div>
                    <div className="mt-3">
                      <Badge variant={accountReady ? "default" : "outline"}>
                        {accountReady ? "User can sign in normally" : "User needs attention"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {accountReady
                        ? "The account has a password, is active, and does not require a forced password change."
                        : "Review the checklist before treating this account as fully ready."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-foreground">Password State</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant={user.hasPassword ? "default" : "outline"}>
                        {user.hasPassword ? "Password set" : "No password set"}
                      </Badge>
                      {user.mustChangePassword ? <Badge variant="outline">Must change password</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {user.mustChangePassword
                        ? "The next successful password entry will route the user into a mandatory password change."
                        : "The user can continue with their current password policy state."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-semibold text-foreground">Trust Signals</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">Reports made: {user._count.reportsMade}</Badge>
                      <Badge variant="outline">Reports against: {user._count.reportsAgainst}</Badge>
                      <Badge variant="outline">Certificates: {user._count.certificates}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Use these signals to decide whether access changes or password resets need escalation.
                    </p>
                  </div>
                </div>

                {accountReady ? (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Account is ready</AlertTitle>
                    <AlertDescription>
                      The user has an active account state and does not have a pending forced password change.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-amber-200 bg-amber-50 text-amber-950 [&>svg]:text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Account needs attention</AlertTitle>
                    <AlertDescription>
                      {accountReadiness
                        .filter((item) => !item.ok)
                        .map((item) => (
                          <p key={item.label}>Missing: {item.label}</p>
                        ))}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Recent Learning Activity</h2>
                  <p className="text-sm text-muted-foreground">A quick snapshot of the user’s latest enrollments.</p>
                </div>
                <div className="space-y-3">
                  {user.enrollments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">This user has no course enrollments yet.</p>
                  ) : (
                    user.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="rounded-lg border border-border bg-muted/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{enrollment.course.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Enrolled {new Date(enrollment.createdAt).toLocaleString("en-ZW")}
                            </p>
                          </div>
                          <div className="text-right">
                            <StatusBadge kind="course" value={enrollment.course.status} />
                            <p className="mt-2 text-xs text-muted-foreground">{formatUsd(enrollment.course.price)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {user.courses.length > 0 ? (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recent Instructor Courses</h2>
                    <p className="text-sm text-muted-foreground">
                      Latest course submissions associated with this user as an instructor.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {user.courses.map((course) => (
                      <div key={course.id} className="rounded-lg border border-border bg-muted/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{course.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Created {new Date(course.createdAt).toLocaleString("en-ZW")}
                            </p>
                          </div>
                          <div className="text-right">
                            <StatusBadge kind="course" value={course.status} />
                            <p className="mt-2 text-xs text-muted-foreground">{formatUsd(course.price)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-4 self-start xl:sticky xl:top-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Account Controls</h2>
                  <p className="text-sm text-muted-foreground">
                    Adjust access and issue a temporary password when support intervention is needed.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-user-role">Role</Label>
                    <select
                      id="admin-user-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as ReviewUser["role"])}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      disabled={isSaving}
                    >
                      <option value="student">student</option>
                      <option value="instructor">instructor</option>
                      <option value="internal_instructor">internal_instructor</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-user-status">Status</Label>
                    <select
                      id="admin-user-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ReviewUser["status"])}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      disabled={isSaving}
                    >
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="banned">banned</option>
                    </select>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="flex flex-col gap-2">
                  <Button variant="secondary" onClick={() => void save()} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button onClick={() => void resetPassword()} disabled={isSaving}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Resetting generates a temporary password and forces the user to choose a new password before they
                    can complete sign-in.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Account Summary</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>Password login: {user.hasPassword ? "Enabled" : "Not set"}</p>
                  <p>Forced password change: {user.mustChangePassword ? "Required" : "Not required"}</p>
                  <p>Instructor application: {user.instructorApplication?.status ?? "None"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Quick Links</p>
                <div className="mt-3 flex flex-col gap-2">
                  <Button variant="outline" onClick={() => router.push("/admin/users")}>
                    Return to Users
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
