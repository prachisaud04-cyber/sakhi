import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'SAKHI — Intelligent Personal Safety Companion',
  description: 'Protection when you need it. Privacy when you don\'t.',
  generator: 'SAKHI',
  icons: {
    icon: '/sakhi-logo.png',
    apple: '/sakhi-logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#090b15' },
    { media: '(prefers-color-scheme: dark)', color: '#090b15' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable}`}>
      <body className="antialiased font-sans bg-[#090b15] text-[#f8fafc]">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
