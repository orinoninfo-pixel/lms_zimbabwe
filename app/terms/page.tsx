import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sections = [
  {
    title: "Platform Use",
    body:
      "By using Learnify, you agree to use the platform lawfully and responsibly. Accounts, course access, and learning resources must not be misused, redistributed, or accessed in a way that harms the platform or other users.",
  },
  {
    title: "Accounts and Access",
    body:
      "Users are responsible for maintaining accurate account information and protecting their login credentials. Learnify may suspend or restrict access where misuse, fraud, or policy violations are identified.",
  },
  {
    title: "Payments and Enrollments",
    body:
      "Paid services, subscriptions, and enrollments are subject to the pricing and billing terms shown at the time of purchase. Access periods and renewal behavior may vary depending on the product or subscription type.",
  },
  {
    title: "Content and Intellectual Property",
    body:
      "Course materials, recordings, downloads, and platform content remain the property of Learnify or its licensors. Content may not be copied, republished, shared, or resold without written permission.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1>
              <p className="mt-3 text-muted-foreground">
                These terms outline the rules, responsibilities, and conditions for using Learnify.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {sections.map((section) => (
                <Card key={section.title} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">{section.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
