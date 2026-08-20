import { prisma } from "@/lib/prisma"

export const tutorialInclude = {
  sections: {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" as const },
        include: {
          codeExamples: { orderBy: { order: "asc" as const } },
          exercises: { orderBy: { order: "asc" as const } },
          quiz: {
            include: {
              questions: {
                orderBy: { order: "asc" as const },
                include: { options: { orderBy: { order: "asc" as const } } },
              },
            },
          },
        },
      },
    },
  },
}

export async function getPublishedTutorial(slug: string) {
  return prisma.tutorial.findFirst({ where: { slug, status: "published" }, include: tutorialInclude })
}

export function flattenTutorialLessons<T extends { sections: Array<{ lessons: unknown[] }> }>(tutorial: T) {
  return tutorial.sections.flatMap((section) => section.lessons)
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
