import { LiveLessonsManager } from "@/components/shared/live-lessons-manager"

export default function InternalInstructorLiveLessonsPage() {
  return (
    <LiveLessonsManager
      lessonsApiBasePath="/api/internal-instructor/live-lessons"
      subjectsApiBasePath="/api/internal-instructor/subjects"
      coursesApiBasePath="/api/internal-instructor/courses"
    />
  )
}
