import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { HealthProvider } from '@/lib/health-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'HealthPulse - Healthcare Monitoring Dashboard',
  description: 'Track vital signs, blood pressure, and health metrics with real-time monitoring',
  generator: 'v0.app',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <HealthProvider>
          {children}
        </HealthProvider>
        <Analytics />
      </body>
    </html>
  )
}
