import Link from "next/link"
import { Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { searchPublishedContent } from "@/lib/search"

export const dynamic = "force-dynamic"
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? ""
  const results = q.length >= 2 ? await searchPublishedContent(q) : []
  return <div className="min-h-screen bg-background"><Navbar /><main className="mx-auto min-h-[70vh] max-w-5xl px-4 pb-16 pt-28 sm:px-6"><h1 className="text-3xl font-semibold">Search Dzidza Hub</h1><form className="mt-6 flex gap-2" action="/search"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Search courses, subjects, tutorials, and lessons" className="pl-10" minLength={2} maxLength={100} /></div><Button type="submit">Search</Button></form>{q ? <div className="mt-8"><p className="mb-4 text-sm text-muted-foreground">{results.length} results for “{q}”</p>{results.length ? <div className="space-y-3">{results.map((result) => <Link key={`${result.type}-${result.id}`} href={result.href} className="block rounded-xl border border-border bg-card p-5 transition hover:border-primary/40"><Badge variant="secondary">{result.type}</Badge><h2 className="mt-3 text-lg font-semibold">{result.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{result.description}</p></Link>)}</div> : <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No published content matched your search.</div>}</div> : <p className="mt-8 text-muted-foreground">Enter at least two characters to search all published learning content.</p>}</main><Footer /></div>
}
