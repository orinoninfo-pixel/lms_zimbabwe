import type { Metadata } from 'next'
import { Inter, Manrope, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

// next/font self-hosts and inlines these at build time — no runtime request
// to fonts.googleapis.com, and `swap` avoids invisible-text on slow links.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" })
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL('https://lms-zimbabwe.onrender.com'),
  applicationName: 'Zim Learning',
  title: {
    default: 'Zim Learning | Learn Online with Courses, Zimbabwe Learning Hub, and Corporate Training',
    template: '%s | Zim Learning',
  },
  description: 'Zim Learning helps Zimbabwean students, professionals, and teams grow with online courses, school support, certificates, and corporate training.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Zim Learning',
    description: 'Online learning for Zimbabwean students, teams, and lifelong learners.',
    type: 'website',
    siteName: 'Zim Learning',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zim Learning',
    description: 'Online learning for Zimbabwean students, teams, and lifelong learners.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} ${manrope.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
