import { redirect } from "next/navigation"
import { requireRoleForPage } from "@/lib/rbac"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  if (!(await requireRoleForPage("student"))) redirect("/login")
  return children
}
