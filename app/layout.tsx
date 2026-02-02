import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import './smooth-scroll.css'
import Providers from "@/components/Providers";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Human DeFi | The $WLD Whale Intel & Sovereign Asset Management',
  description: 'Human DeFi: The world\'s most advanced sovereign wallet. Secure, AI-powered asset management with zkSNARK privacy.',
  keywords: ['DeFi', 'Whale Tracker', 'Worldcoin', 'WLD', 'AI Wallet', 'Crypto Security'],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  themeColor: '#000000',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Human DeFi',
  },
  openGraph: {
    title: 'Human DeFi | Sovereign Asset Management',
    description: 'Sovereign asset management with AI-powered security and privacy.',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <ClientLayout>
              {children}
            </ClientLayout>
            <Toaster position="top-right" />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
