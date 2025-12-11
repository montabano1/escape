import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Engineering Escape Room',
  description: 'Collaborative real-time escape room for engineering teams',
  // Add metadata that may help with corporate filters
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

