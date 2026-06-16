export type UserRole = "student" | "instructor" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Course {
  id: string
  title: string
  description: string
  price: number
  instructorId: string
  thumbnail: string
}

export interface Section {
  id: string
  courseId: string
  title: string
  order: number
}

export interface Lesson {
  id: string
  sectionId: string
  title: string
  videoUrl: string
  order: number
}

export interface Enrollment {
  userId: string
  courseId: string
}

export interface Progress {
  userId: string
  lessonId: string
  completed: boolean
}

export const MOCK_USER_ID = "u1"

export const users: User[] = [
  { id: "u1", name: "John Student", email: "john@example.com", role: "student" },
  { id: "u2", name: "Sarah Instructor", email: "sarah@example.com", role: "instructor" },
  { id: "u3", name: "Alex Instructor", email: "alex@example.com", role: "instructor" },
]

export const courses: Course[] = [
  {
    id: "c1",
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, and Node.js by building real projects.",
    price: 89,
    instructorId: "u2",
    thumbnail: "/placeholder.jpg",
  },
  {
    id: "c2",
    title: "Data Science with Python",
    description: "Learn Python, pandas, visualization, and fundamentals of machine learning.",
    price: 99,
    instructorId: "u3",
    thumbnail: "/placeholder.jpg",
  },
  {
    id: "c3",
    title: "UI/UX Design Masterclass",
    description: "Design better products with practical UI/UX workflows and case studies.",
    price: 79,
    instructorId: "u2",
    thumbnail: "/placeholder.jpg",
  },
]

export const sections: Section[] = [
  { id: "s1", courseId: "c1", title: "Introduction", order: 1 },
  { id: "s2", courseId: "c1", title: "Core Concepts", order: 2 },
  { id: "s3", courseId: "c2", title: "Getting Started", order: 1 },
  { id: "s4", courseId: "c2", title: "Working with Data", order: 2 },
  { id: "s5", courseId: "c3", title: "Foundations", order: 1 },
  { id: "s6", courseId: "c3", title: "Design Systems", order: 2 },
]

export const lessons: Lesson[] = [
  {
    id: "l1",
    sectionId: "s1",
    title: "Welcome",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 1,
  },
  {
    id: "l2",
    sectionId: "s1",
    title: "Setup",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    order: 2,
  },
  {
    id: "l3",
    sectionId: "s2",
    title: "HTML & CSS Essentials",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 1,
  },
  {
    id: "l4",
    sectionId: "s2",
    title: "JavaScript Basics",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    order: 2,
  },
  {
    id: "l5",
    sectionId: "s3",
    title: "Course Overview",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 1,
  },
  {
    id: "l6",
    sectionId: "s3",
    title: "Python Setup",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    order: 2,
  },
  {
    id: "l7",
    sectionId: "s4",
    title: "Pandas Basics",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 1,
  },
  {
    id: "l8",
    sectionId: "s4",
    title: "Data Visualization",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    order: 2,
  },
  {
    id: "l9",
    sectionId: "s5",
    title: "What is UX?",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 1,
  },
  {
    id: "l10",
    sectionId: "s5",
    title: "UI Basics",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    order: 2,
  },
  {
    id: "l11",
    sectionId: "s6",
    title: "Typography & Color",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    order: 1,
  },
  {
    id: "l12",
    sectionId: "s6",
    title: "Components & Tokens",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    order: 2,
  },
]

export const enrollments: Enrollment[] = [{ userId: MOCK_USER_ID, courseId: "c1" }]

export const progress: Progress[] = [
  { userId: MOCK_USER_ID, lessonId: "l1", completed: true },
  { userId: MOCK_USER_ID, lessonId: "l2", completed: true },
]

export type CourseSummary = Course & { instructorName: string }
export type SectionWithLessons = Section & { lessons: Lesson[] }
export type CourseWithCurriculum = Course & {
  instructor: User
  sections: SectionWithLessons[]
}

function byOrder<T extends { order: number }>(a: T, b: T) {
  return a.order - b.order
}

export function getUserById(userId: string) {
  return users.find((u) => u.id === userId) ?? null
}

export function getCourseById(courseId: string) {
  return courses.find((c) => c.id === courseId) ?? null
}

export function getLessonById(lessonId: string) {
  return lessons.find((l) => l.id === lessonId) ?? null
}

export function listCourses(): CourseSummary[] {
  return courses.map((course) => {
    const instructorName = getUserById(course.instructorId)?.name ?? "Unknown"
    return { ...course, instructorName }
  })
}

export function getCourseWithCurriculum(courseId: string): CourseWithCurriculum | null {
  const course = getCourseById(courseId)
  if (!course) return null

  const instructor = getUserById(course.instructorId)
  if (!instructor) return null

  const courseSections = sections
    .filter((s) => s.courseId === courseId)
    .slice()
    .sort(byOrder)
    .map((section) => ({
      ...section,
      lessons: lessons
        .filter((l) => l.sectionId === section.id)
        .slice()
        .sort(byOrder),
    }))

  return { ...course, instructor, sections: courseSections }
}

export function enrollUserInCourse(input: Enrollment): Enrollment {
  const { userId, courseId } = input
  if (!getUserById(userId)) {
    throw new Error("User not found")
  }
  if (!getCourseById(courseId)) {
    throw new Error("Course not found")
  }

  const already = enrollments.find((e) => e.userId === userId && e.courseId === courseId)
  if (already) return already

  const next = { userId, courseId }
  enrollments.push(next)
  return next
}

export function listMyCourses(userId: string): CourseSummary[] {
  const myCourseIds = new Set(enrollments.filter((e) => e.userId === userId).map((e) => e.courseId))
  return listCourses().filter((c) => myCourseIds.has(c.id))
}

export function listLessonIdsForCourse(courseId: string): string[] {
  const sectionIds = sections
    .filter((s) => s.courseId === courseId)
    .slice()
    .sort(byOrder)
    .map((s) => s.id)

  return sectionIds.flatMap((sectionId) =>
    lessons
      .filter((l) => l.sectionId === sectionId)
      .slice()
      .sort(byOrder)
      .map((l) => l.id)
  )
}

export function upsertLessonProgress(input: { userId: string; lessonId: string; completed: boolean }) {
  const { userId, lessonId, completed } = input
  if (!getUserById(userId)) {
    throw new Error("User not found")
  }
  if (!getLessonById(lessonId)) {
    throw new Error("Lesson not found")
  }

  const existing = progress.find((p) => p.userId === userId && p.lessonId === lessonId)
  if (existing) {
    existing.completed = completed
    return existing
  }

  const next: Progress = { userId, lessonId, completed }
  progress.push(next)
  return next
}

export function getCourseProgress(input: { userId: string; courseId: string }) {
  const { userId, courseId } = input
  if (!getUserById(userId)) {
    throw new Error("User not found")
  }
  if (!getCourseById(courseId)) {
    throw new Error("Course not found")
  }

  const lessonIds = listLessonIdsForCourse(courseId)
  const totalLessons = lessonIds.length
  if (totalLessons === 0) {
    return { userId, courseId, totalLessons: 0, completedLessons: 0, percent: 0 }
  }

  const completedLessons = lessonIds.reduce((acc, lessonId) => {
    const isCompleted = progress.some((p) => p.userId === userId && p.lessonId === lessonId && p.completed)
    return acc + (isCompleted ? 1 : 0)
  }, 0)

  const percent = Math.round((completedLessons / totalLessons) * 100)
  return { userId, courseId, totalLessons, completedLessons, percent }
}
