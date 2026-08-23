import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
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
  manifest: '/manifest.json',
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
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration notice: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
