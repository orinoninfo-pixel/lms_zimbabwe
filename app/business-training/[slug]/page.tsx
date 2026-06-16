import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { businessTrainingPrograms, getBusinessTrainingProgram, type TrainingBadge } from "@/lib/business-training"

const badgeVariant = (badge: TrainingBadge) => {
  if (badge === "Most Popular") return "default"
  if (badge === "Enterprise Favorite") return "secondary"
  if (badge === "New") return "outline"
  return "default"
}

export function generateStaticParams() {
  return businessTrainingPrograms.map((program) => ({ slug: program.slug }))
}

export default async function BusinessTrainingDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = getBusinessTrainingProgram(slug)

  if (!program) notFound()

  const salesSubject = encodeURIComponent(`${program.title} corporate training enquiry`)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/for-business">For Business</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{program.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={badgeVariant(program.badge)}>{program.badge}</Badge>
                    {program.deliveryOptions.map((option) => (
                      <Badge key={option} variant="outline">
                        {option}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{program.title}</h1>
                    <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{program.shortDescription}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Duration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{program.duration}</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm sm:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Delivery Options</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{program.deliveryOptions.join(", ")}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Corporate Training Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Plan a private team cohort with tailored labs, custom examples, and flexible scheduling.
                      </p>
                      <Button asChild className="w-full">
                        <Link href="/for-business#request-training">Request Corporate Training</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <a href={`mailto:sales@learnify.co.za?subject=${salesSubject}`}>Contact Sales</a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 shadow-sm">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">{program.overview}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {program.prerequisites.map((item) => (
                        <li key={item} className="rounded-lg border border-border bg-muted/30 p-3">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Learning Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {program.learningOutcomes.map((item) => (
                        <li key={item} className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Who Should Attend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {program.whoShouldAttend.map((item) => (
                        <li key={item} className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Detailed Course Curriculum / Syllabus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {program.curriculum.map((module, index) => (
                      <div key={module} className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground">Module {index + 1}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{module}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {program.faqs.map((faq) => (
                    <div key={faq.question} className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium text-foreground">{faq.question}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Ready to train your team?</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Request a private cohort or speak with our team about tailoring this programme to your business.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild>
                      <Link href="/for-business#request-training">Request Corporate Training</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <a href={`mailto:sales@learnify.co.za?subject=${salesSubject}`}>Contact Sales</a>
                    </Button>
                  </div>
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
