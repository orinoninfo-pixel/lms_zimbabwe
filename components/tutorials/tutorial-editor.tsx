"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

type Metadata = { slug: string; title: string; shortDescription: string; description: string; icon: string | null; imageUrl: string | null; difficulty: "beginner" | "intermediate" | "advanced"; estimatedDuration: number; status: "draft" | "published" }
const initial: Metadata = { slug: "", title: "", shortDescription: "", description: "", icon: "Code2", imageUrl: null, difficulty: "beginner", estimatedDuration: 60, status: "draft" }

function structureFromTutorial(tutorial: Record<string, unknown>) {
  const sections = Array.isArray(tutorial.sections) ? tutorial.sections : []
  return { sections: sections.map((rawSection) => { const section = rawSection as Record<string, unknown>; const lessons = Array.isArray(section.lessons) ? section.lessons : []; return { id: section.id, title: section.title, slug: section.slug, description: section.description, lessons: lessons.map((rawLesson) => { const lesson = rawLesson as Record<string, unknown>; return { id: lesson.id, title: lesson.title, slug: lesson.slug, summary: lesson.summary, content: lesson.content, estimatedMinutes: lesson.estimatedMinutes, isPublished: lesson.isPublished, codeExamples: lesson.codeExamples, exercises: lesson.exercises, quiz: lesson.quiz } }) } }) }
}

export function TutorialEditor({ tutorialId, basePath }: { tutorialId?: string; basePath: "/admin" | "/internal-instructor" }) {
  const router = useRouter()
  const [metadata, setMetadata] = useState<Metadata>(initial)
  const [structure, setStructure] = useState(JSON.stringify({ sections: [] }, null, 2))
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (!tutorialId) return; void fetch(`/api/content/tutorials/${tutorialId}`, { cache: "no-store" }).then((response) => response.json()).then(({ tutorial }) => { if (!tutorial) return; setMetadata({ slug: tutorial.slug, title: tutorial.title, shortDescription: tutorial.shortDescription, description: tutorial.description, icon: tutorial.icon, imageUrl: tutorial.imageUrl, difficulty: tutorial.difficulty, estimatedDuration: tutorial.estimatedDuration, status: tutorial.status }); setStructure(JSON.stringify(structureFromTutorial(tutorial), null, 2)) }) }, [tutorialId])
  async function save() {
    setBusy(true)
    try {
      const metadataResponse = await fetch(tutorialId ? `/api/content/tutorials/${tutorialId}` : "/api/content/tutorials", { method: tutorialId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(metadata) })
      const metadataJson = await metadataResponse.json().catch(() => null)
      if (!metadataResponse.ok) throw new Error(metadataJson?.error ?? "Could not save tutorial")
      const id = tutorialId ?? metadataJson.tutorial.id
      let parsedStructure: unknown
      try { parsedStructure = JSON.parse(structure) } catch { throw new Error("Curriculum JSON is not valid") }
      const structureResponse = await fetch(`/api/content/tutorials/${id}/structure`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsedStructure) })
      const structureJson = await structureResponse.json().catch(() => null)
      if (!structureResponse.ok) throw new Error(structureJson?.error ?? "Could not save curriculum")
      toast({ title: "Tutorial saved", description: metadata.status === "published" ? "The public tutorial is updated." : "Draft changes are saved." })
      router.push(`${basePath}/tutorials/${id}`); router.refresh()
    } catch (error) { toast({ title: "Save failed", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" }) } finally { setBusy(false) }
  }
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold">{tutorialId ? "Edit tutorial" : "Create tutorial"}</h1><p className="mt-1 text-sm text-muted-foreground">Draft content stays private. Publish only after every intended lesson is marked published.</p></div><section className="grid gap-5 rounded-xl border border-border bg-card p-6 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={metadata.title} onChange={(event) => setMetadata({ ...metadata, title: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="slug">URL slug</Label><Input id="slug" value={metadata.slug} onChange={(event) => setMetadata({ ...metadata, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div><div className="space-y-2 md:col-span-2"><Label htmlFor="short">Card description</Label><Input id="short" value={metadata.shortDescription} onChange={(event) => setMetadata({ ...metadata, shortDescription: event.target.value })} /></div><div className="space-y-2 md:col-span-2"><Label htmlFor="description">Full description</Label><Textarea id="description" value={metadata.description} onChange={(event) => setMetadata({ ...metadata, description: event.target.value })} /></div><div className="space-y-2"><Label>Difficulty</Label><Select value={metadata.difficulty} onValueChange={(difficulty: Metadata["difficulty"]) => setMetadata({ ...metadata, difficulty })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="duration">Estimated minutes</Label><Input id="duration" type="number" min={1} value={metadata.estimatedDuration} onChange={(event) => setMetadata({ ...metadata, estimatedDuration: Number(event.target.value) })} /></div><div className="space-y-2"><Label>Status</Label><Select value={metadata.status} onValueChange={(status: Metadata["status"]) => setMetadata({ ...metadata, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div></section><section className="rounded-xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Curriculum structure</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Sections and lessons are ordered by their position in this validated JSON document. Content blocks support paragraph, heading, note, tip, warning, and list. Lessons can contain codeExamples, exercises, and a quiz with exactly one correct option per question.</p><Label htmlFor="structure" className="mt-5 block">Validated curriculum JSON</Label><Textarea id="structure" value={structure} onChange={(event) => setStructure(event.target.value)} className="mt-2 min-h-[520px] font-mono text-xs leading-5" spellCheck={false} /></section><div className="flex gap-3"><Button onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save tutorial"}</Button><Button variant="outline" onClick={() => router.push(`${basePath}/tutorials`)}>Cancel</Button></div></div>
}
