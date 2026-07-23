import { HomeworkManager } from "@/components/shared/homework-manager"

export default function InstructorHomeworkPage() {
  return (
    <HomeworkManager
      homeworkApiBasePath="/api/instructor/homework"
      subjectsApiBasePath="/api/instructor/subjects"
    />
  )
}
