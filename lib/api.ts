const API_URL = "/api"

export interface CourseSummary {
  id: string
  title: string
  description: string
  price: number
  instructorId: string
  thumbnail: string
  instructorName: string
}

export interface CourseWithCurriculum extends Omit<CourseSummary, "instructorName"> {
  instructor: { id: string; name: string; email: string; role: string }
  sections: Array<{
    id: string
    courseId: string
    title: string
    order: number
    lessons: Array<{
      id: string
      sectionId: string
      title: string
      videoUrl: string
      order: number
    }>
  }>
}

export async function fetchCourses(): Promise<CourseSummary[]> {
  const res = await fetch(`${API_URL}/courses`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch courses")
  return res.json()
}

export async function fetchCourse(id: string): Promise<CourseWithCurriculum> {
  const res = await fetch(`${API_URL}/courses/${id}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch course")
  return res.json()
}

export async function enroll(courseId: string, userId?: string) {
  const res = await fetch(`${API_URL}/enroll`, {
    method: "POST",
    body: JSON.stringify({ courseId, userId }),
    headers: { "Content-Type": "application/json" },
  })
  return res.json()
}

export async function fetchMyCourses() {
  const res = await fetch(`${API_URL}/my-courses`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch enrolled courses")
  return res.json()
}

export async function updateProgress(lessonId: string, completed = true, userId?: string) {
  const res = await fetch(`${API_URL}/progress`, {
    method: "POST",
    body: JSON.stringify({ lessonId, completed, userId }),
    headers: { "Content-Type": "application/json" },
  })
  return res.json()
}

export async function fetchCourseProgress(courseId: string) {
  const res = await fetch(`${API_URL}/progress/${courseId}`, { cache: "no-store" })
  return res.json()
}
