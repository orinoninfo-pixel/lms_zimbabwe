import { HomeworkManager } from "@/components/shared/homework-manager"

export default function InternalInstructorHomeworkPage() {
  return (
    <HomeworkManager
      homeworkApiBasePath="/api/internal-instructor/homework"
      subjectsApiBasePath="/api/internal-instructor/subjects"
    />
  )
}
