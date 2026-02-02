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
  description: 'The world\'s most advanced non-custodial wallet for $WLD. Track whales, copy-trade profits, and manage assets with zkSNARK privacy and AI rebalancing.',
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
    description: 'Master the markets with AI-powered whale tracking and sovereign wallet security.',
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
