"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Award,
  BadgeCheck,
  Briefcase,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LineChart,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type Category = { id: string; name: string; slug: string }

const whyTeach = [
  {
    title: "Reach motivated learners",
    description: "Build a global audience of learners looking for practical, outcomes-driven training.",
    icon: Users,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Create with confidence",
    description: "Use guided structures to publish clear, high-quality courses that learners finish.",
    icon: ClipboardCheck,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Earn revenue",
    description: "Monetize your expertise with a marketplace model designed for sustainable creator growth.",
    icon: LineChart,
    color: "bg-violet-100 text-violet-700",
  },
  {
    title: "Maintain credibility",
    description: "Verified instructor applications help keep the platform trusted and professional.",
    icon: ShieldCheck,
    color: "bg-amber-100 text-amber-700",
  },
] as const

const benefits = [
  { title: "Instructor profile", description: "Showcase your background, credentials, and course catalog.", icon: BadgeCheck, color: "bg-cyan-100 text-cyan-700" },
  { title: "Course creation tools", description: "Structure your content into sections and lessons with clear outcomes.", icon: FileText, color: "bg-pink-100 text-pink-700" },
  { title: "Learner certificates", description: "Help learners celebrate progress with certificates and achievements.", icon: Award, color: "bg-amber-100 text-amber-700" },
  { title: "Team and enterprise opportunities", description: "Offer training to companies through corporate cohorts and programs.", icon: Briefcase, color: "bg-emerald-100 text-emerald-700" },
] as const

const requirements = [
  "Proven expertise in your subject area",
  "Professional communication and learner-first teaching style",
  "Real-world experience or relevant certifications",
  "Ability to create structured, outcome-based course content",
  "Reliable availability to support learners and respond to questions",
]

const faqs = [
  {
    q: "How long does the application review take?",
    a: "Applications are reviewed in order. We’ll email you with an update once a decision is made or if we need more details.",
  },
  {
    q: "Do I need to have an existing Zim Learning account?",
    a: "No. If your email isn’t registered, Zim Learning will create a learner account for you when you apply so we can track your application.",
  },
  {
    q: "What course topics perform best?",
    a: "Courses that solve a clear problem and include practical exercises tend to perform best. We also prioritize topics aligned to current learner demand.",
  },
  {
    q: "Can my application be updated after submission?",
    a: "Yes. You can submit again with the same email address to update your details while the application is pending.",
  },
]

export default function BecomeInstructorPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [linkedinProfile, setLinkedinProfile] = useState("")
  const [areaOfExpertise, setAreaOfExpertise] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [professionalCertifications, setProfessionalCertifications] = useState("")
  const [biography, setBiography] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [sampleCourseProposal, setSampleCourseProposal] = useState("")
  const [preferredCourseCategories, setPreferredCourseCategories] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoadingCategories(true)
      setCategoriesError(null)
      const res = await fetch("/api/categories", { cache: "no-store" }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (cancelled) return
      if (!res || !res.ok) {
        setCategories([])
        setCategoriesError(json?.error ?? "Failed to load categories")
        setIsLoadingCategories(false)
        return
      }
      setCategories((json?.categories ?? []) as Category[])
      setIsLoadingCategories(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const canSubmit = useMemo(() => {
    if (!fullName.trim()) return false
    if (!email.trim()) return false
    if (!phoneNumber.trim()) return false
    if (!linkedinProfile.trim()) return false
    if (!areaOfExpertise.trim()) return false
    if (!yearsOfExperience.trim()) return false
    if (biography.trim().length < 50) return false
    if (!resume) return false
    if (sampleCourseProposal.trim().length < 50) return false
    if (preferredCourseCategories.length === 0) return false
    return true
  }, [fullName, email, phoneNumber, linkedinProfile, areaOfExpertise, yearsOfExperience, biography, resume, sampleCourseProposal, preferredCourseCategories])

  const toggleCategory = (slug: string) => {
    setPreferredCourseCategories((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError(null)
    setSuccess(false)
    setBusy(true)

    try {
      const fd = new FormData()
      fd.set("fullName", fullName.trim())
      fd.set("email", email.trim())
      fd.set("phoneNumber", phoneNumber.trim())
      fd.set("linkedinProfile", linkedinProfile.trim())
      fd.set("areaOfExpertise", areaOfExpertise.trim())
      fd.set("yearsOfExperience", yearsOfExperience.trim())
      fd.set("professionalCertifications", professionalCertifications.trim())
      fd.set("biography", biography.trim())
      fd.set("sampleCourseProposal", sampleCourseProposal.trim())
      if (resume) fd.set("resume", resume)
      for (const slug of preferredCourseCategories) fd.append("preferredCourseCategories", slug)

      const res = await fetch("/api/instructor/apply", { method: "POST", body: fd }).catch(() => null)
      const json = res ? await res.json().catch(() => null) : null
      if (!res || !res.ok) throw new Error(json?.error ?? "Application submission failed")

      setSuccess(true)
      setFullName("")
      setEmail("")
      setPhoneNumber("")
      setLinkedinProfile("")
      setAreaOfExpertise("")
      setYearsOfExperience("")
      setProfessionalCertifications("")
      setBiography("")
      setResume(null)
      setSampleCourseProposal("")
      setPreferredCourseCategories([])
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Unknown error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground">
                  <span className="flex h-2 w-2 rounded-full bg-accent" />
                  Build courses. Teach learners. Earn revenue.
                </div>
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Become an Instructor on Zim Learning
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Join a professional learning marketplace where qualified experts publish high-quality courses and help learners reach real outcomes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg">
                  <a href="#apply">Apply to Teach</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/courses">Browse courses</Link>
                </Button>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Learners", value: "50K+" },
                { label: "Courses", value: "500+" },
                { label: "Instructors", value: "200+" },
                { label: "Avg rating", value: "4.9" },
              ].map((stat) => (
                <Card key={stat.label} className="shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10">
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Why Teach on Zim Learning</h2>
                <p className="mt-2 text-muted-foreground">A platform built for trust, quality, and learner outcomes.</p>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {whyTeach.map((item) => {
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
            </div>

            <div className="mt-10">
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Instructor Benefits</h2>
                <p className="mt-2 text-muted-foreground">Tools and support designed for professional creators.</p>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((item) => {
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
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {[
                    { step: "Apply", text: "Share your experience, expertise, and a course proposal." },
                    { step: "Review", text: "Our team validates applications to keep Zim Learning trusted." },
                    { step: "Create Courses", text: "Build structured lessons with clear outcomes and resources." },
                    { step: "Earn Revenue", text: "Publish and earn as learners enroll and progress." },
                  ].map((row) => (
                    <div key={row.step} className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="font-medium text-foreground">{row.step}</p>
                      <p className="mt-1">{row.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 shadow-sm">
                <CardHeader>
                  <CardTitle>Instructor Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {requirements.map((req) => (
                      <div key={req} className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">{req}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Frequently Asked Questions</h2>
                <p className="mt-2 text-muted-foreground">Quick answers about teaching on Zim Learning.</p>
              </div>
              <div className="mt-6 mx-auto max-w-3xl rounded-xl border border-border bg-card p-2 shadow-sm">
                <Accordion type="single" collapsible>
                  {faqs.map((item) => (
                    <AccordionItem key={item.q} value={item.q}>
                      <AccordionTrigger className="px-4">{item.q}</AccordionTrigger>
                      <AccordionContent className="px-4 text-muted-foreground">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            <div id="apply" className="mt-10 grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>Apply to Teach</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Submit a professional application. If approved, you’ll get access to the instructor portal to create and manage courses.
                  </p>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-foreground">Tip</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A clear course proposal and strong biography helps reviewers approve faster.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Application review</Badge>
                    <Badge variant="secondary">Quality checks</Badge>
                    <Badge variant="secondary">Instructor portal</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 shadow-sm">
                <CardHeader className="space-y-2">
                  <CardTitle>Instructor Application</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Already approved? <Link href="/login" className="text-accent hover:underline">Log in</Link> as an instructor.
                  </p>
                </CardHeader>
                <CardContent>
                  {success ? (
                    <div className="mb-5 rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium text-foreground">Application submitted</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Thanks — we’ll email you after review. You can re-submit with the same email to update a pending application.
                      </p>
                    </div>
                  ) : null}
                  {error ? (
                    <div className="mb-5 rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  ) : null}

                  <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="fullName">
                        Full Name
                      </label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="email">
                        Email
                      </label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="phoneNumber">
                        Phone Number
                      </label>
                      <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="linkedinProfile">
                        LinkedIn Profile
                      </label>
                      <Input
                        id="linkedinProfile"
                        type="url"
                        value={linkedinProfile}
                        onChange={(e) => setLinkedinProfile(e.target.value)}
                        placeholder="https://www.linkedin.com/in/your-profile"
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="areaOfExpertise">
                        Area of Expertise
                      </label>
                      <Input
                        id="areaOfExpertise"
                        value={areaOfExpertise}
                        onChange={(e) => setAreaOfExpertise(e.target.value)}
                        placeholder="e.g. Data Analytics, Web Development, Project Management"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="yearsOfExperience">
                        Years of Experience
                      </label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        min={0}
                        max={60}
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="professionalCertifications">
                        Professional Certifications
                      </label>
                      <Input
                        id="professionalCertifications"
                        value={professionalCertifications}
                        onChange={(e) => setProfessionalCertifications(e.target.value)}
                        placeholder="e.g. AWS, Azure, PMP, Microsoft"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="biography">
                        Biography
                      </label>
                      <Textarea
                        id="biography"
                        value={biography}
                        onChange={(e) => setBiography(e.target.value)}
                        placeholder="Share your background, teaching experience, and what learners can expect..."
                        required
                      />
                      <p className="text-xs text-muted-foreground">Minimum 50 characters.</p>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="resume">
                        CV/Resume Upload
                      </label>
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX. Max 5MB.</p>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="sampleCourseProposal">
                        Sample Course Proposal
                      </label>
                      <Textarea
                        id="sampleCourseProposal"
                        value={sampleCourseProposal}
                        onChange={(e) => setSampleCourseProposal(e.target.value)}
                        placeholder="Include course title, target audience, key outcomes, and a rough lesson outline..."
                        required
                      />
                      <p className="text-xs text-muted-foreground">Minimum 50 characters.</p>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground">Preferred Course Categories</label>
                      {isLoadingCategories ? (
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                          <p className="text-sm text-muted-foreground">Loading categories...</p>
                        </div>
                      ) : categoriesError ? (
                        <div className="rounded-lg border border-border bg-card p-4">
                          <p className="text-sm text-destructive">{categoriesError}</p>
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {categories.map((c) => (
                            <label key={c.slug} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                              <input
                                type="checkbox"
                                checked={preferredCourseCategories.includes(c.slug)}
                                onChange={() => toggleCategory(c.slug)}
                              />
                              <span className="text-muted-foreground">{c.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">Select at least one category.</p>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <Button type="submit" className="w-full" disabled={!canSubmit || busy}>
                        {busy ? "Submitting..." : "Submit Instructor Application"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-10 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">Ready to teach?</p>
                    <p className="mt-1 text-sm text-muted-foreground">Apply today and start building your instructor catalog on Zim Learning.</p>
                  </div>
                </div>
                <Button asChild>
                  <a href="#apply">Apply Now</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

