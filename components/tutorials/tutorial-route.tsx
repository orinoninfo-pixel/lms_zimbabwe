import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { TutorialReader } from "@/components/tutorials/tutorial-reader"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPublishedTutorial } from "@/lib/tutorials"

export async function TutorialRoute({ tutorialSlug, lessonSlug }: { tutorialSlug: string; lessonSlug?: string }) {
  const tutorial = await getPublishedTutorial(tutorialSlug)
  if (!tutorial) notFound()
  const lessons = tutorial.sections.flatMap((section) => section.lessons)
  const currentLesson = lessonSlug ? lessons.find((lesson) => lesson.slug === lessonSlug) : lessons[0]
  if (!currentLesson) notFound()

  const session = await getSession()
  const studentId = session?.role === "student" ? session.userId : null
  const [progress, bookmark] = studentId
    ? await Promise.all([
        prisma.tutorialProgress.findMany({ where: { userId: studentId, tutorialId: tutorial.id, completedAt: { not: null } }, select: { lessonId: true } }),
        prisma.tutorialBookmark.findUnique({ where: { userId_lessonId: { userId: studentId, lessonId: currentLesson.id } }, select: { id: true } }),
      ])
    : [[], null]

  const readerTutorial = {
    id: tutorial.id,
    slug: tutorial.slug,
    title: tutorial.title,
    icon: tutorial.icon,
    sections: tutorial.sections.map((section) => ({
      id: section.id,
      title: section.title,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        estimatedMinutes: lesson.estimatedMinutes,
        content: lesson.content,
        codeExamples: lesson.codeExamples.map(({ id, title, language, sourceCode, expectedOutput, explanation }) => ({ id, title, language, sourceCode, expectedOutput, explanation })),
        exercises: lesson.exercises.map(({ id, title, instructions, starterCode, expectedAnswer, explanation }) => ({ id, title, instructions, starterCode, expectedAnswer, explanation })),
        quiz: lesson.quiz ? {
          title: lesson.quiz.title,
          questions: lesson.quiz.questions.map((question) => ({ id: question.id, prompt: question.prompt, options: question.options.map(({ id, text, isCorrect }) => ({ id, text, isCorrect })) })),
        } : null,
      })),
    })),
  }
  const readerLesson = readerTutorial.sections.flatMap((section) => section.lessons).find((lesson) => lesson.id === currentLesson.id)
  if (!readerLesson) notFound()

  return <><Navbar /><TutorialReader tutorial={readerTutorial} currentLesson={readerLesson} completedLessonIds={progress.map((item) => item.lessonId)} bookmarked={Boolean(bookmark)} authenticated={Boolean(studentId)} /></>
}
