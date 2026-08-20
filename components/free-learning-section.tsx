import Link from "next/link"
import { ArrowRight, Braces, Code2, Database, FileCode2, GitBranch, Palette } from "lucide-react"

const topics = [
  { name: "Python", href: "/learn/python", icon: Code2, available: true },
  { name: "JavaScript", href: "/learn?topic=javascript", icon: Braces, available: false },
  { name: "HTML", href: "/learn?topic=html", icon: FileCode2, available: false },
  { name: "CSS", href: "/learn?topic=css", icon: Palette, available: false },
  { name: "SQL", href: "/learn?topic=sql", icon: Database, available: false },
  { name: "Git", href: "/learn?topic=git", icon: GitBranch, available: false },
]

export function FreeLearningSection() {
  return <section className="border-y border-border bg-muted/25 py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Dzidza Free Learning</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Build practical skills for free</h2><p className="mt-3 max-w-2xl text-muted-foreground">Follow original step-by-step tutorials, practise with code examples, and save your progress when you sign in.</p></div><Link href="/learn" className="inline-flex items-center font-semibold text-primary hover:underline">Explore free tutorials <ArrowRight className="ml-2 h-4 w-4" /></Link></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{topics.map((topic) => <Link key={topic.name} href={topic.href} className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"><topic.icon className="h-6 w-6 text-primary" /><p className="mt-3 font-medium">{topic.name}</p><p className="mt-1 text-xs text-muted-foreground">{topic.available ? "Start learning" : "Coming soon"}</p></Link>)}</div></div></section>
}
