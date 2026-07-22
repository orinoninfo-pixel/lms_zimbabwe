import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { CoursesSection } from "@/components/courses-section"
import { Footer } from "@/components/footer"

// Public, non-personalized landing page — ISR instead of per-request
// rendering so it serves from the edge on repeat visits.
export const revalidate = 120

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50/50">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <CoursesSection />
      <Footer />
    </main>
  )
}
