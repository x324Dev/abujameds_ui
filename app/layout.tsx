import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { AuthProvider } from './providers/auth-provider'
import { SiteHeader } from '@/components/patient/site-header'
import { SiteFooter } from '@/components/patient/site-footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AbujaMeds — Find your medication in Abuja, in seconds',
  description:
    'Search thousands of PCN-licensed pharmacies across the FCT in real time, verify drug authenticity with NAFDAC data, and find healthcare facilities near you.',
  generator: 'v0.app',
  applicationName: 'AbujaMeds',
  keywords: [
    'Abuja',
    'pharmacy',
    'medication',
    'NAFDAC',
    'drug verification',
    'FCT',
    'healthcare',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0a6e4f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
        <SiteHeader/>
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <SiteFooter/>
        </AuthProvider>
      </body>
    </html>
  )
}
