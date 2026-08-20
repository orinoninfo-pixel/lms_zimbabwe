import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { getStudentCourseSummaries } from "@/lib/course-progress"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }
  if (session.role !== "student") {
    return Response.json({ error: "Only students can view enrolled courses" }, { status: 403 })
  }
  const userId = session.userId

  const courses = await getStudentCourseSummaries(userId)

  return Response.json({ userId, courses })
}
