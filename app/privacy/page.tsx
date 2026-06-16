import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sections = [
  {
    title: "Information We Collect",
    body:
      "Learnify collects the information you provide when you create an account, enroll in courses, request business training, or contact support. This may include your name, email address, role, course activity, and billing-related records.",
  },
  {
    title: "How We Use Information",
    body:
      "We use your information to deliver learning services, personalize your dashboard, process enrollments, issue certificates, respond to support requests, and improve the platform experience.",
  },
  {
    title: "Data Sharing",
    body:
      "We do not sell personal information. Data is shared only with service providers and infrastructure partners required to operate the platform, process payments, or support legitimate business operations.",
  },
  {
    title: "Security and Retention",
    body:
      "We apply reasonable technical and organizational safeguards to protect user data. Information is retained only for as long as needed to provide services, meet legal obligations, or resolve disputes.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
              <p className="mt-3 text-muted-foreground">
                Learn how Learnify collects, uses, and protects personal information across the platform.
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
