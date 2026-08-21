"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Bookmark, BookmarkCheck, Braces, Check, CheckCircle2, ChevronLeft, ChevronRight, Code2, FileCode2, Lightbulb, Menu, Search, TriangleAlert } from "lucide-react"
import { CodeExample } from "@/components/tutorials/code-example"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type ContentBlock = { type: string; text?: string; items?: string[]; level?: number }
type Lesson = { id: string; slug: string; title: string; summary: string; estimatedMinutes: number; content: unknown; codeExamples: Array<{ id: string; title: string; language: string; sourceCode: string; expectedOutput: string | null; explanation: string | null }>; exercises: Array<{ id: string; title: string; instructions: string; starterCode: string | null; expectedAnswer: string | null; explanation: string | null }>; quiz: { title: string; questions: Array<{ id: string; prompt: string; options: Array<{ id: string; text: string; isCorrect: boolean }> }> } | null }
type Section = { id: string; title: string; lessons: Lesson[] }

const TUTORIAL_ICONS: Record<string, typeof Code2> = { Code2, Braces, FileCode2 }

function TutorialBrand({ title, icon }: { title: string; icon?: string | null }) {
  const Icon = (icon && TUTORIAL_ICONS[icon]) || Code2
  return <span className="flex items-center gap-3 rounded-lg bg-slate-900 p-4 text-white"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/25 text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0"><span className="block truncate text-base font-semibold leading-tight">{title}</span><span className="block truncate text-xs text-slate-400">Free Tutorial</span></span></span>
}

function TutorialNav({ tutorialSlug, sections, currentLessonId, completed, onNavigate }: { tutorialSlug: string; sections: Section[]; currentLessonId: string; completed: Set<string>; onNavigate?: () => void }) {
  const [search, setSearch] = useState("")
  return <div className="space-y-5"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this tutorial" className="pl-9" aria-label="Search tutorial lessons" /></div>{sections.map((section) => {
    const lessons = section.lessons.filter((lesson) => lesson.title.toLowerCase().includes(search.toLowerCase()))
    if (!lessons.length) return null
    return <section key={section.id}><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3><div className="space-y-0.5">{lessons.map((lesson) => { const isCurrent = currentLessonId === lesson.id; const isDone = completed.has(lesson.id); return <Link key={lesson.id} href={`/learn/${tutorialSlug}/${lesson.slug}`} onClick={onNavigate} className={cn("flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors", isCurrent ? "bg-primary/10 font-semibold text-primary" : "text-foreground/75 hover:bg-muted hover:text-foreground")}><span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", isCurrent ? "bg-primary" : isDone ? "bg-emerald-500" : "bg-border")} /><span className="min-w-0 flex-1 truncate">{lesson.title}</span>{isDone && !isCurrent ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : null}{isCurrent ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" /> : null}</Link> })}</div></section>
  })}</div>
}

function LessonBlocks({ content }: { content: unknown }) {
  const blocks = Array.isArray(content) ? content.filter((item): item is ContentBlock => Boolean(item) && typeof item === "object" && "type" in item) : []
  return <div className="space-y-5">{blocks.map((block, index) => {
    if (block.type === "heading") return block.level === 3 ? <h3 key={index} className="pt-3 text-xl font-semibold">{block.text}</h3> : <h2 key={index} className="pt-4 text-2xl font-semibold tracking-tight">{block.text}</h2>
    if (block.type === "list") return <ul key={index} className="ml-6 list-disc space-y-2 text-foreground/80">{block.items?.map((item) => <li key={item}>{item}</li>)}</ul>
    if (["note", "tip", "warning"].includes(block.type)) return <aside key={index} className={cn("flex gap-3 rounded-lg border p-4 text-sm leading-6", block.type === "warning" ? "border-amber-500/30 bg-amber-500/10" : block.type === "tip" ? "border-emerald-500/30 bg-emerald-500/10" : "border-blue-500/30 bg-blue-500/10")}>{block.type === "warning" ? <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" /> : <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />}<div><p className="font-semibold capitalize">{block.type}</p><p className="text-foreground/75">{block.text}</p></div></aside>
    return <p key={index} className="text-base leading-8 text-foreground/80">{block.text}</p>
  })}</div>
}

export function TutorialReader({ tutorial, currentLesson, completedLessonIds, bookmarked, authenticated }: { tutorial: { id: string; slug: string; title: string; icon?: string | null; sections: Section[] }; currentLesson: Lesson; completedLessonIds: string[]; bookmarked: boolean; authenticated: boolean }) {
  const allLessons = useMemo(() => tutorial.sections.flatMap((section) => section.lessons), [tutorial.sections])
  const currentIndex = allLessons.findIndex((lesson) => lesson.id === currentLesson.id)
  const previous = allLessons[currentIndex - 1]
  const next = allLessons[currentIndex + 1]
  const [completed, setCompleted] = useState(new Set(completedLessonIds))
  const [isBookmarked, setBookmarked] = useState(bookmarked)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showAnswers, setShowAnswers] = useState(false)

  async function updateProgress() {
    if (!authenticated) return
    const complete = !completed.has(currentLesson.id)
    const response = await fetch(`/api/tutorials/${tutorial.slug}/progress`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: currentLesson.id, completed: complete }) })
    if (response.ok) setCompleted((previousSet) => { const nextSet = new Set(previousSet); complete ? nextSet.add(currentLesson.id) : nextSet.delete(currentLesson.id); return nextSet })
  }

  async function updateBookmark() {
    if (!authenticated) return
    const response = await fetch(`/api/tutorials/${tutorial.slug}/bookmarks`, { method: isBookmarked ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: currentLesson.id }) })
    if (response.ok) setBookmarked(!isBookmarked)
  }

  return <div className="min-h-screen bg-background pt-16">
    <aside className="fixed bottom-0 left-0 top-16 hidden w-72 overflow-y-auto border-r border-border bg-card p-5 lg:block"><Link href={`/learn/${tutorial.slug}`} className="mb-5 block"><TutorialBrand title={tutorial.title} icon={tutorial.icon} /></Link><TutorialNav tutorialSlug={tutorial.slug} sections={tutorial.sections} currentLessonId={currentLesson.id} completed={completed} /></aside>
    <main className="lg:ml-72 xl:mr-64"><div className="mx-auto max-w-4xl px-4 py-8 sm:px-7 lg:py-12">
      <div className="mb-7 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/learn" className="hover:text-foreground">Free Learning</Link><span>/</span><span>{tutorial.title}</span></div><Sheet><SheetTrigger asChild><Button variant="outline" size="sm" className="lg:hidden"><Menu className="mr-2 h-4 w-4" />Lessons</Button></SheetTrigger><SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto"><SheetHeader className="sr-only"><SheetTitle>{tutorial.title}</SheetTitle></SheetHeader><div className="mb-5"><TutorialBrand title={tutorial.title} icon={tutorial.icon} /></div><TutorialNav tutorialSlug={tutorial.slug} sections={tutorial.sections} currentLessonId={currentLesson.id} completed={completed} /></SheetContent></Sheet></div>
      <header className="border-b border-border pb-7"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">Lesson {currentIndex + 1} of {allLessons.length} · {currentLesson.estimatedMinutes} min</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{currentLesson.title}</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">{currentLesson.summary}</p></div>{authenticated ? <Button variant="outline" size="icon" onClick={() => void updateBookmark()} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark lesson"}>{isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}</Button> : null}</div></header>
      <article className="py-8"><LessonBlocks content={currentLesson.content} />{currentLesson.codeExamples.map((example) => <CodeExample key={example.id} {...example} />)}{currentLesson.exercises.map((exercise) => { const exerciseLanguage = currentLesson.codeExamples[0]?.language ?? "text"; return <section key={exercise.id} className="my-8 rounded-xl border border-primary/25 bg-primary/5 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Exercise</p><h2 className="mt-2 text-xl font-semibold">{exercise.title}</h2><p className="mt-3 leading-7 text-foreground/75">{exercise.instructions}</p>{exercise.starterCode ? <CodeExample title="Starter code" language={exerciseLanguage} sourceCode={exercise.starterCode} /> : null}<details className="mt-4"><summary className="cursor-pointer font-medium text-primary">Show one possible answer</summary>{exercise.expectedAnswer ? <CodeExample title="Possible answer" language={exerciseLanguage} sourceCode={exercise.expectedAnswer} explanation={exercise.explanation} /> : null}</details></section> })}
      {currentLesson.quiz ? <section className="my-8 rounded-xl border border-border p-5"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Knowledge check</p><h2 className="mt-2 text-xl font-semibold">{currentLesson.quiz.title}</h2><div className="mt-5 space-y-6">{currentLesson.quiz.questions.map((question) => <fieldset key={question.id}><legend className="font-medium">{question.prompt}</legend><div className="mt-3 grid gap-2">{question.options.map((option) => { const chosen = selectedAnswers[question.id] === option.id; return <button type="button" key={option.id} onClick={() => setSelectedAnswers((answers) => ({ ...answers, [question.id]: option.id }))} className={cn("rounded-lg border px-4 py-3 text-left text-sm", chosen ? "border-primary bg-primary/10" : "border-border hover:bg-muted", showAnswers && chosen && (option.isCorrect ? "border-emerald-500 bg-emerald-500/10" : "border-destructive bg-destructive/10"))}>{option.text}</button> })}</div></fieldset>)}<Button onClick={() => setShowAnswers(true)}>Check answers</Button></div></section> : null}</article>
      {!authenticated ? <div className="mb-7 rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm"><Link href={`/login?next=/learn/${tutorial.slug}/${currentLesson.slug}`} className="font-semibold text-primary">Log in</Link> to save progress and bookmarks. Reading remains free.</div> : <Button onClick={() => void updateProgress()} variant={completed.has(currentLesson.id) ? "outline" : "default"}>{completed.has(currentLesson.id) ? <Check className="mr-2 h-4 w-4" /> : null}{completed.has(currentLesson.id) ? "Completed" : "Mark lesson complete"}</Button>}
      <nav className="mt-10 grid grid-cols-2 gap-3 border-t border-border pt-6">{previous ? <Button asChild variant="outline" className="justify-start"><Link href={`/learn/${tutorial.slug}/${previous.slug}`}><ChevronLeft className="mr-2 h-4 w-4" />{previous.title}</Link></Button> : <span />}{next ? <Button asChild className="justify-end"><Link href={`/learn/${tutorial.slug}/${next.slug}`}>{next.title}<ChevronRight className="ml-2 h-4 w-4" /></Link></Button> : <span />}</nav>
    </div></main>
    <aside className="fixed bottom-0 right-0 top-16 hidden w-64 overflow-y-auto border-l border-border bg-card p-5 xl:block"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In this lesson</p><div className="mt-4 space-y-2 text-sm text-foreground/70"><p>{currentLesson.summary}</p>{currentLesson.codeExamples.length ? <p>Code examples: {currentLesson.codeExamples.length}</p> : null}{currentLesson.exercises.length ? <p>Exercises: {currentLesson.exercises.length}</p> : null}</div></aside>
  </div>
}
