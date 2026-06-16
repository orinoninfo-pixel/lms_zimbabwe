import Link from "next/link"
import { BookOpen, Briefcase, LifeBuoy, Mail } from "lucide-react"

const footerLinks = {
  Product: [
    { label: "Courses", href: "/courses" },
    { label: "Categories", href: "/categories" },
    { label: "Zimbabwe Learning Hub", href: "/zimbabwe-learning-hub" },
    { label: "For Business", href: "/for-business" },
  ],
  "Zim Learning": [
    { label: "Home", href: "/" },
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Resources: [
    { label: "Help Center", href: "/help" },
    { label: "My Courses", href: "/dashboard/courses" },
    { label: "Certificates", href: "/dashboard/certificates" },
    { label: "Achievements", href: "/dashboard/achievements" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
}

const quickLinks = [
  { name: "Courses", icon: BookOpen, href: "/courses" },
  { name: "Business", icon: Briefcase, href: "/for-business#request-training" },
  { name: "Support", icon: LifeBuoy, href: "/help" },
  { name: "Email", icon: Mail, href: "mailto:support@zimlearning.co.zw" },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-6">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-lg font-bold text-primary-foreground">Z</span>
                </div>
                <span className="text-xl font-semibold text-foreground">Zim Learning</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                Supporting Zimbabwean learners with online courses, exam preparation, and flexible learning pathways.
              </p>
              <div className="mt-6 flex gap-4">
                {quickLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      aria-label={item.name}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  )
                })}
              </div>
            </div>
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-semibold text-foreground">{category}</h3>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zim Learning. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
