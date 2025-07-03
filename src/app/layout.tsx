import type { Metadata } from 'next'
import './globals.css'
import '../styles/resume.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Job Tracker',
  description: 'AI-powered job application tracking and resume customization',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen font-sans antialiased">
        <Navigation />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  )
}