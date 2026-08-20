"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type TutorialRow = { id: string; slug: string; title: string; status: "draft" | "published"; difficulty: string; updatedAt: string; _count: { sections: number } }

export function TutorialAdminList({ basePath }: { basePath: "/admin" | "/internal-instructor" }) {
  const [tutorials, setTutorials] = useState<TutorialRow[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { void fetch("/api/content/tutorials", { cache: "no-store" }).then((response) => response.json()).then((data) => setTutorials(data.tutorials ?? [])).finally(() => setLoading(false)) }, [])
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Free Tutorials</h1><p className="mt-1 text-sm text-muted-foreground">Create, preview, order, and publish Dzidza Free Learning content.</p></div><Button asChild><Link href={`${basePath}/tutorials/new`}><Plus className="mr-2 h-4 w-4" />New tutorial</Link></Button></div><div className="overflow-hidden rounded-xl border border-border bg-card">{loading ? <p className="p-6 text-sm text-muted-foreground">Loading tutorials…</p> : tutorials.length ? <div className="divide-y divide-border">{tutorials.map((tutorial) => <div key={tutorial.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><div className="flex items-center gap-2"><p className="font-semibold">{tutorial.title}</p><Badge variant={tutorial.status === "published" ? "default" : "secondary"}>{tutorial.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">/{tutorial.slug} · {tutorial.difficulty} · {tutorial._count.sections} sections</p></div><div className="flex gap-2">{tutorial.status === "published" ? <Button asChild variant="outline" size="sm"><Link href={`/learn/${tutorial.slug}`} target="_blank">Preview</Link></Button> : null}<Button asChild size="sm"><Link href={`${basePath}/tutorials/${tutorial.id}`}>Edit</Link></Button></div></div>)}</div> : <p className="p-8 text-center text-sm text-muted-foreground">No tutorials yet.</p>}</div></div>
}
