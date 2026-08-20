import test from "node:test"
import assert from "node:assert/strict"
import { TutorialMetadataSchema, TutorialStructureSchema } from "../../lib/tutorial-validation"

test("tutorial metadata accepts a publishable tutorial", () => {
  assert.equal(TutorialMetadataSchema.safeParse({ slug: "python-basics", title: "Python Basics", shortDescription: "A clear introduction to practical Python.", description: "Original lessons that teach practical Python through small examples.", difficulty: "beginner", estimatedDuration: 90, status: "published" }).success, true)
})

test("tutorial slugs and quiz answers are constrained", () => {
  assert.equal(TutorialMetadataSchema.safeParse({ slug: "Bad Slug", title: "Bad", shortDescription: "Too short", description: "Too short", difficulty: "beginner", estimatedDuration: 0, status: "published" }).success, false)
  const structure = { sections: [{ title: "Start", slug: "start", lessons: [{ title: "Lesson", slug: "lesson", summary: "Useful summary", content: [], estimatedMinutes: 5, isPublished: true, codeExamples: [], exercises: [], quiz: { title: "Check", questions: [{ prompt: "Choose", options: [{ text: "A", isCorrect: true }, { text: "B", isCorrect: true }] }] } }] }] }
  assert.equal(TutorialStructureSchema.safeParse(structure).success, false)
})
