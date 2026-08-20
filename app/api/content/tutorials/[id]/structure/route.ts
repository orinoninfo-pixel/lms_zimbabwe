import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { requireAdminOrInternalInstructor } from "@/lib/rbac"
import { TutorialStructureSchema } from "@/lib/tutorial-validation"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrInternalInstructor()
  if (auth instanceof Response) return auth
  const parsed = TutorialStructureSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: "Invalid tutorial structure", details: parsed.error.flatten() }, { status: 400 })
  const { id: tutorialId } = await params
  const existing = await prisma.tutorial.findUnique({ where: { id: tutorialId }, include: { sections: { include: { lessons: true } } } })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })
  const existingSectionIds = new Set(existing.sections.map((section) => section.id))
  const existingLessonIds = new Set(existing.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id)))

  await prisma.$transaction(async (tx) => {
    const keptSectionIds: string[] = []
    const keptLessonIds: string[] = []
    for (const [sectionOrder, inputSection] of parsed.data.sections.entries()) {
      const sectionId = inputSection.id && existingSectionIds.has(inputSection.id) ? inputSection.id : randomUUID()
      const section = await tx.tutorialSection.upsert({ where: { id: sectionId }, update: { title: inputSection.title, slug: inputSection.slug, description: inputSection.description, order: sectionOrder }, create: { id: sectionId, tutorialId, title: inputSection.title, slug: inputSection.slug, description: inputSection.description, order: sectionOrder } })
      keptSectionIds.push(section.id)
      for (const [lessonOrder, inputLesson] of inputSection.lessons.entries()) {
        const lessonId = inputLesson.id && existingLessonIds.has(inputLesson.id) ? inputLesson.id : randomUUID()
        const lesson = await tx.tutorialLesson.upsert({ where: { id: lessonId }, update: { sectionId: section.id, title: inputLesson.title, slug: inputLesson.slug, summary: inputLesson.summary, content: inputLesson.content, estimatedMinutes: inputLesson.estimatedMinutes, isPublished: inputLesson.isPublished, order: lessonOrder }, create: { id: lessonId, sectionId: section.id, title: inputLesson.title, slug: inputLesson.slug, summary: inputLesson.summary, content: inputLesson.content, estimatedMinutes: inputLesson.estimatedMinutes, isPublished: inputLesson.isPublished, order: lessonOrder } })
        keptLessonIds.push(lesson.id)
        await tx.tutorialCodeExample.deleteMany({ where: { lessonId: lesson.id } })
        if (inputLesson.codeExamples.length) await tx.tutorialCodeExample.createMany({ data: inputLesson.codeExamples.map((item, order) => ({ lessonId: lesson.id, title: item.title, language: item.language, sourceCode: item.sourceCode, expectedOutput: item.expectedOutput, explanation: item.explanation, order })) })
        await tx.tutorialExercise.deleteMany({ where: { lessonId: lesson.id } })
        if (inputLesson.exercises.length) await tx.tutorialExercise.createMany({ data: inputLesson.exercises.map((item, order) => ({ lessonId: lesson.id, title: item.title, instructions: item.instructions, starterCode: item.starterCode, expectedAnswer: item.expectedAnswer, explanation: item.explanation, order })) })
        await tx.tutorialQuiz.deleteMany({ where: { lessonId: lesson.id } })
        if (inputLesson.quiz) await tx.tutorialQuiz.create({ data: { lessonId: lesson.id, title: inputLesson.quiz.title, questions: { create: inputLesson.quiz.questions.map((question, order) => ({ prompt: question.prompt, order, options: { create: question.options.map((option, optionOrder) => ({ text: option.text, isCorrect: option.isCorrect, order: optionOrder })) } })) } } })
      }
    }
    await tx.tutorialLesson.deleteMany({ where: { section: { tutorialId }, id: { notIn: keptLessonIds } } })
    await tx.tutorialSection.deleteMany({ where: { tutorialId, id: { notIn: keptSectionIds } } })
    await tx.tutorial.update({ where: { id: tutorialId }, data: { updatedById: auth.user.id } })
  })
  return Response.json({ success: true })
}
