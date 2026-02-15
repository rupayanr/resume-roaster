import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://resumeroaster.rupayan.dev'),
  title: 'Resume Roaster - Get Your Resume Roasted',
  description: 'Upload your resume and get brutally honest AI feedback with actionable suggestions. Fun, useful, and free.',
  openGraph: {
    title: 'Resume Roaster',
    description: 'Get your resume roasted by AI. Brutally honest feedback with actionable suggestions.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Roaster',
    description: 'Get your resume roasted by AI. Brutally honest feedback with actionable suggestions.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
