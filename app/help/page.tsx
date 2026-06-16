import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Help Center</h1>
              <p className="mt-3 text-muted-foreground">Get help with access, billing, courses, and instructor applications.</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Email support and include your account email address, the page you were on, and a short description of the issue.
                  </p>
                  <p className="text-sm font-medium text-foreground">support@zimlearning.co.zw</p>
                  <Button asChild>
                    <a href="mailto:support@zimlearning.co.zw">Email Support</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Instructor Applications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Want to teach on Zim Learning? Apply and our team will review your details and course proposal.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/become-instructor">Become an Instructor</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 text-center">
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

