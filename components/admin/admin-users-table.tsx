"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { FilePenLine, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StatusBadge } from "@/components/admin/status-badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { toast } from "@/hooks/use-toast"

type AdminUser = {
  id: string
  name: string
  email: string
  role: "student" | "instructor" | "admin"
  status: "active" | "suspended" | "banned"
  mustChangePassword: boolean
  createdAt: string
}

const roleOptions: Array<{ value: string; label: string }> = [
  { value: "", label: "All roles" },
  { value: "student", label: "Students" },
  { value: "instructor", label: "Instructors" },
  { value: "admin", label: "Admins" },
]

const statusOptions: Array<{ value: string; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
]

export function AdminUsersTable({ fixedRole }: { fixedRole?: "student" | "instructor" | "admin" }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [role, setRole] = useState<string>(fixedRole ?? "")
  const [status, setStatus] = useState<string>("")
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    const resolvedRole = fixedRole ?? role
    if (resolvedRole) params.set("role", resolvedRole)
    if (status) params.set("status", status)
    if (q.trim()) params.set("q", q.trim())
    const s = params.toString()
    return s ? `?${s}` : ""
  }, [fixedRole, role, status, q])

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/users${queryString}`, { cache: "no-store", signal }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) {
      setUsers([])
      setIsLoading(false)
      setError(json?.error ?? "Failed to load users")
      return
    }
    setUsers((json?.users ?? []) as AdminUser[])
    setIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [queryString])

  const patchUser = async (body: unknown) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) throw new Error(json?.error ?? "Request failed")
    return json
  }

  const deleteUser = async (userId: string) => {
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => null)
    const json = res ? await res.json().catch(() => null) : null
    if (!res || !res.ok) throw new Error(json?.error ?? "Delete failed")
    return json
  }

  const onSetRole = async (userId: string, nextRole: AdminUser["role"]) => {
    setBusyUserId(userId)
    try {
      await patchUser({ userId, action: "setRole", role: nextRole })
      toast({ title: "Role updated" })
      await load()
    } catch (e) {
      toast({ title: "Failed to update role", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyUserId(null)
    }
  }

  const onStatusAction = async (userId: string, action: "activate" | "suspend" | "ban") => {
    setBusyUserId(userId)
    try {
      await patchUser({ userId, action })
      toast({ title: "User updated" })
      await load()
    } catch (e) {
      toast({ title: "Failed to update user", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyUserId(null)
    }
  }

  const onDelete = async (userId: string) => {
    setBusyUserId(userId)
    try {
      await deleteUser(userId)
      toast({ title: "User deleted" })
      await load()
    } catch (e) {
      toast({ title: "Failed to delete user", description: e instanceof Error ? e.message : "Unknown error" })
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col gap-4 p-5 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {fixedRole === "instructor" ? "Instructors" : fixedRole === "student" ? "Students" : "Users"}
          </h2>
          <p className="text-sm text-muted-foreground">Manage accounts, roles, and access</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email..." />
          </div>
          <div className="flex items-center gap-3">
            {!fixedRole ? (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {roleOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : null}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {isLoading ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : null}

      {!isLoading && users.length === 0 ? (
        <div className="p-6">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" />
              <EmptyTitle>No users found</EmptyTitle>
              <EmptyDescription>Try adjusting your filters or search term.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      ) : null}

      {users.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const busy = busyUserId === u.id
                return (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        {u.mustChangePassword ? (
                          <Badge variant="outline" className="mt-2 border-amber-200 bg-amber-50 text-amber-800">
                            Password change required
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => void onSetRole(u.id, e.target.value as AdminUser["role"])}
                        disabled={busy}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-60"
                        aria-label="Role"
                      >
                        <option value="student">student</option>
                        <option value="instructor">instructor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge kind="user" value={u.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${u.id}`}>
                            <FilePenLine className="h-4 w-4" />
                            Review
                          </Link>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void onStatusAction(u.id, "activate")}
                          disabled={busy || u.status === "active"}
                        >
                          Activate
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void onStatusAction(u.id, "suspend")}
                          disabled={busy || u.status === "suspended"}
                        >
                          Suspend
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="destructive" size="sm" disabled={busy}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          }
                          title="Delete user?"
                          description="This action is permanent. The user will lose access immediately."
                          confirmText="Delete"
                          onConfirm={() => void onDelete(u.id)}
                          disabled={busy}
                        />
                        <ConfirmDialog
                          trigger={
                            <Button variant="outline" size="sm" disabled={busy || u.status === "banned"}>
                              Ban
                            </Button>
                          }
                          title="Ban user?"
                          description="Banned users cannot log in. You can unban by setting status to Active."
                          confirmText="Ban user"
                          onConfirm={() => void onStatusAction(u.id, "ban")}
                          disabled={busy || u.status === "banned"}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
