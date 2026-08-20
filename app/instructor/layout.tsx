import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  if (!(await requireRoleForPage("instructor"))) redirect("/login")
  return children
}
