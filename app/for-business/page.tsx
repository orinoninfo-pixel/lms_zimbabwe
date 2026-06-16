"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Award, Briefcase, CalendarDays, GraduationCap, Layers3, Users, Video, Building2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { businessTrainingPrograms, type TrainingBadge } from "@/lib/business-training"

type TrainingRequest = {
  companyName: string
  contactPerson: string
  email: string
  phone: string
  trainingTopic: string
  learnersCount: string
  preferredDate: string
  message: string
}

const initialRequest: TrainingRequest = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  trainingTopic: "",
  learnersCount: "",
  preferredDate: "",
  message: "",
}

type DeliveryOption = {
  name: string
  description: string
  icon: typeof Video
  color: string
}

const deliveryOptions: DeliveryOption[] = [
  {
    name: "Online Instructor-Led",
    description: "Live sessions with a trainer, hands-on exercises, and Q&A for your team.",
    icon: Video,
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Onsite Training",
    description: "In-person delivery at your office with tailored examples and team collaboration.",
    icon: Building2,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Hybrid Learning",
    description: "A blended approach combining live online sessions with onsite workshops.",
    icon: Layers3,
    color: "bg-violet-100 text-violet-700",
  },
  {
    name: "Self-Paced Learning",
    description: "Flexible learning paths for individuals with optional instructor support.",
    icon: GraduationCap,
    color: "bg-amber-100 text-amber-700",
  },
]

const benefitCards = [
  {
    title: "Custom Programs",
    description: "Training tailored to your team’s roles, tools, and targets.",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Team Upskilling",
    description: "Build practical skills with guided, project-based learning.",
    icon: Users,
    color: "bg-violet-100 text-violet-700",
  },
  {
    title: "Flexible Scheduling",
    description: "Run sessions across time zones, shifts, or sprint cycles.",
    icon: CalendarDays,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Certificates",
    description: "Provide completion certificates for internal tracking and CPD.",
    icon: Award,
    color: "bg-amber-100 text-amber-700",
  },
] as const

const programColors = [
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-amber-100 text-amber-700",
] as const

const badgeVariant = (badge: TrainingBadge) => {
  if (badge === "Most Popular") return "default"
  if (badge === "Enterprise Favorite") return "secondary"
  if (badge === "New") return "outline"
  return "default"
}

export default function ForBusinessPage() {
  const [request, setRequest] = useState<TrainingRequest>(initialRequest)
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = useMemo(() => {
    if (!request.companyName.trim()) return false
    if (!request.contactPerson.trim()) return false
    if (!request.email.trim()) return false
    if (!request.trainingTopic.trim()) return false
    return true
  }, [request])

  const update = (key: keyof TrainingRequest, value: string) => {
    setRequest((prev) => ({ ...prev, [key]: value }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
    setRequest(initialRequest)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Corporate Training for Growing Teams
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Upskill your team with custom online or in-person training programs designed around your goals, schedule,
                and industry needs.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefitCards.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.title} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-10">
              <div className="flex flex-col gap-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Popular Corporate Training Programs
                </h2>
                <p className="text-muted-foreground">
                  A curated set of programs we frequently deliver for teams across industries.
                </p>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {businessTrainingPrograms.map((program, index) => (
                  <Link key={program.slug} href={`/business-training/${program.slug}`} className="group block">
                    <Card className="h-full shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-muted-foreground/20">
                      <CardHeader className="pb-2">
                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${programColors[index % programColors.length]}`}>
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-base leading-snug">{program.title}</CardTitle>
                          <Badge variant={badgeVariant(program.badge)}>{program.badge}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{program.shortDescription}</p>
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Typical duration</span>
                            <span className="font-medium text-foreground">{program.duration}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Delivery</span>
                            <span className="font-medium text-foreground">{program.deliveryOptions.join(", ")}</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                          View training details
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-5 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Can&apos;t find the training you need? Request a custom programme.
                </p>
                <div className="mt-3">
                  <Button asChild variant="outline">
                    <Link href="/for-business#request-training">Request Custom Programme</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex flex-col gap-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Training Delivery Options
                </h2>
                <p className="text-muted-foreground">Choose the format that best fits your team’s schedule and goals.</p>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {deliveryOptions.map((o) => (
                  <Card key={o.name} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${o.color}`}>
                        <o.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{o.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{o.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div id="request-training" className="mt-10 grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>How it works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="font-medium text-foreground">1) Tell us what you need</p>
                    <p className="mt-1">Share your topic, team size, and preferred delivery style.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="font-medium text-foreground">2) We propose a plan</p>
                    <p className="mt-1">You’ll get a program outline with timing and outcomes.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="font-medium text-foreground">3) Deliver & track</p>
                    <p className="mt-1">Run sessions, track participation, and issue certificates.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 shadow-sm">
                <CardHeader>
                  <CardTitle>Request Training</CardTitle>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="mb-5 rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium text-foreground">Request received</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Thanks — we’ll be in touch to discuss your training requirements.
                      </p>
                    </div>
                  ) : null}

                  <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="companyName">
                        Company name
                      </label>
                      <Input
                        id="companyName"
                        value={request.companyName}
                        onChange={(e) => update("companyName", e.target.value)}
                        placeholder="e.g. Acme (Pty) Ltd"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="contactPerson">
                        Contact person
                      </label>
                      <Input
                        id="contactPerson"
                        value={request.contactPerson}
                        onChange={(e) => update("contactPerson", e.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="email">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={request.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="name@company.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="phone">
                        Phone
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={request.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+27 ..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="learnersCount">
                        Number of learners
                      </label>
                      <Input
                        id="learnersCount"
                        type="number"
                        min={1}
                        value={request.learnersCount}
                        onChange={(e) => update("learnersCount", e.target.value)}
                        placeholder="e.g. 25"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="trainingTopic">
                        Training topic
                      </label>
                      <Input
                        id="trainingTopic"
                        value={request.trainingTopic}
                        onChange={(e) => update("trainingTopic", e.target.value)}
                        placeholder="e.g. Excel for Finance, Leadership, Cybersecurity awareness"
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="preferredDate">
                        Preferred date
                      </label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={request.preferredDate}
                        onChange={(e) => update("preferredDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="message">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        value={request.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder="Tell us about goals, timelines, and any must-have topics..."
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <Button type="submit" className="w-full" disabled={!canSubmit}>
                        Request Corporate Training
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
