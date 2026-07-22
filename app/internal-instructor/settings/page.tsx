import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function InternalInstructorSettingsPage() {
  const auth = await requireRoleForPage("internal_instructor")
  if (!auth) redirect("/")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">Your Content Manager account details</p>
      </div>

      <Card className="max-w-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full name</dt>
              <dd className="text-sm text-foreground">{auth.user.name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
              <dd className="text-sm text-foreground">{auth.user.email}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</dt>
              <dd className="text-sm text-foreground">Internal Instructor (Content Manager)</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            To change your name, email, or password, contact a platform administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
