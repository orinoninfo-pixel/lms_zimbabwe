import { AdminSettingsForm } from "@/components/admin/admin-settings-form"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure platform defaults and financial settings</p>
      </div>
      <AdminSettingsForm />
    </div>
  )
}
