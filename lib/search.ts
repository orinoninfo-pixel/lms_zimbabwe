import { prisma } from "@/lib/prisma"

export type SearchResult = { id: string; type: "Course" | "Subject" | "Tutorial" | "Tutorial Lesson"; title: string; description: string; href: string }

export async function searchPublishedContent(rawQuery: string): Promise<SearchResult[]> {
  const query = rawQuery.trim().slice(0, 100)
  if (query.length < 2) return []
  const contains = { contains: query, mode: "insensitive" as const }
  const [courses, subjects, tutorials, lessons] = await Promise.all([
    prisma.course.findMany({ where: { status: "approved", OR: [{ title: contains }, { description: contains }] }, select: { id: true, title: true, description: true }, take: 8 }),
    prisma.subjectPackage.findMany({ where: { status: "approved", OR: [{ title: contains }, { subject: contains }, { description: contains }] }, select: { id: true, title: true, description: true }, take: 8 }),
    prisma.tutorial.findMany({ where: { status: "published", OR: [{ title: contains }, { shortDescription: contains }, { description: contains }] }, select: { id: true, slug: true, title: true, shortDescription: true }, take: 8 }),
    prisma.tutorialLesson.findMany({ where: { isPublished: true, section: { tutorial: { status: "published" } }, OR: [{ title: contains }, { summary: contains }] }, select: { id: true, slug: true, title: true, summary: true, section: { select: { tutorial: { select: { slug: true, title: true } } } } }, take: 12 }),
  ])
  return [
    ...courses.map((item) => ({ id: item.id, type: "Course" as const, title: item.title, description: item.description, href: `/course/${item.id}` })),
    ...subjects.map((item) => ({ id: item.id, type: "Subject" as const, title: item.title, description: item.description, href: `/zimbabwe-learning-hub/${item.id}` })),
    ...tutorials.map((item) => ({ id: item.id, type: "Tutorial" as const, title: item.title, description: item.shortDescription, href: `/learn/${item.slug}` })),
    ...lessons.map((item) => ({ id: item.id, type: "Tutorial Lesson" as const, title: item.title, description: `${item.section.tutorial.title}: ${item.summary}`, href: `/learn/${item.section.tutorial.slug}/${item.slug}` })),
  ]
}
