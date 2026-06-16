import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://learnify.co.zw'),
  applicationName: 'Learnify',
  title: {
    default: 'Learnify | Learn Online with Courses, Zimbabwe Learning Hub, and Corporate Training',
    template: '%s | Learnify',
  },
  description: 'Learnify helps students, professionals, and teams grow with online courses, school support, certificates, and corporate training.',
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
    title: 'Learnify',
    description: 'Online learning for students, teams, and lifelong learners.',
    type: 'website',
    siteName: 'Learnify',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learnify',
    description: 'Online learning for students, teams, and lifelong learners.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geist.className} ${geistMono.className} font-sans antialiased`}>
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
