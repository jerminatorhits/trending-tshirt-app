import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trending T-Shirt Generator',
  description: 'AI-powered T-shirt designs based on trending topics',
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

