import { z } from "zod"

const slug = z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const contentBlock = z.object({ type: z.enum(["paragraph", "heading", "note", "tip", "warning", "list"]), text: z.string().max(10_000).optional(), items: z.array(z.string().max(2_000)).max(50).optional(), level: z.number().int().min(2).max(3).optional() })
const example = z.object({ id: z.string().uuid().optional(), title: z.string().min(1).max(150), language: z.string().min(1).max(30), sourceCode: z.string().max(50_000), expectedOutput: z.string().max(20_000).nullable().optional(), explanation: z.string().max(10_000).nullable().optional() })
const exercise = z.object({ id: z.string().uuid().optional(), title: z.string().min(1).max(150), instructions: z.string().min(1).max(10_000), starterCode: z.string().max(50_000).nullable().optional(), expectedAnswer: z.string().max(50_000).nullable().optional(), explanation: z.string().max(10_000).nullable().optional() })
const quiz = z.object({ title: z.string().min(1).max(150), questions: z.array(z.object({ prompt: z.string().min(1).max(2_000), options: z.array(z.object({ text: z.string().min(1).max(500), isCorrect: z.boolean() })).min(2).max(8).refine((options) => options.filter((option) => option.isCorrect).length === 1, "Each question needs exactly one correct answer") })).max(30) })

export const TutorialMetadataSchema = z.object({
  slug,
  title: z.string().trim().min(2).max(150),
  shortDescription: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20).max(5_000),
  icon: z.string().max(80).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedDuration: z.number().int().min(1).max(100_000),
  status: z.enum(["draft", "published"]),
})

export const TutorialStructureSchema = z.object({ sections: z.array(z.object({
  id: z.string().uuid().optional(), title: z.string().min(1).max(150), slug, description: z.string().max(2_000).nullable().optional(),
  lessons: z.array(z.object({
    id: z.string().uuid().optional(), title: z.string().min(1).max(150), slug, summary: z.string().min(5).max(1_000), content: z.array(contentBlock).max(100), estimatedMinutes: z.number().int().min(1).max(600), isPublished: z.boolean(),
    codeExamples: z.array(example).max(20), exercises: z.array(exercise).max(20), quiz: quiz.nullable().optional(),
  })).max(200),
})).max(100) })

export type TutorialMetadataInput = z.infer<typeof TutorialMetadataSchema>
export type TutorialStructureInput = z.infer<typeof TutorialStructureSchema>
