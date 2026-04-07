import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://resumeroaster.rupayan.dev'),
  title: 'Resume Roaster - Your resume sucks. Let AI tell you why.',
  description: 'Upload your resume and get brutally honest AI feedback with actionable suggestions. No sugarcoating. No mercy. 🔥',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Resume Roaster 🔥',
    description: 'Your resume sucks. Let AI tell you why. Brutally honest feedback with actionable suggestions.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Roaster 🔥',
    description: 'Your resume sucks. Let AI tell you why. Brutally honest feedback with actionable suggestions.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 min-h-screen antialiased text-gray-100">
        {children}
      </body>
    </html>
  )
}
