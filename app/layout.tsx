import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#FAFAF8',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'RatesChallenge — Is Your Business Overpaying on Rates?',
    template: '%s — RatesChallenge',
  },
  description:
    'Compare your rateable value per m² against official VOA 2023 data. See in 60 seconds if you have grounds to challenge your business rates.',
  keywords: [
    'business rates challenge',
    'rateable value appeal',
    'VOA comparable data',
    'business rates reduction',
    'check rateable value',
    'rates challenge evidence',
  ],
  authors: [{ name: 'RatesChallenge', url: 'https://rateschallenge.co.uk' }],
  creator: 'RatesChallenge',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: '/',
    siteName: 'RatesChallenge',
    title: 'RatesChallenge — Is Your Business Overpaying on Rates?',
    description:
      'Compare your rateable value per m² against 2.1 million VOA properties. Generate a professional evidence bundle in minutes.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RatesChallenge',
    description:
      'Check if your business is overpaying on rates. Built on official VOA data.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}