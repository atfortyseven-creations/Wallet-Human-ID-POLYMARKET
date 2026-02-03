import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import './smooth-scroll.css'
import Providers from "@/components/Providers";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Human DeFi: La plataforma líder',
  description: 'Human DeFi: La plataforma líder de activos soberanos. Gestión segura impulsada por IA con privacidad zkSNARK.',
  keywords: ['DeFi', 'Whale Tracker', 'Worldcoin', 'WLD', 'AI Wallet', 'Crypto Security'],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  themeColor: '#000000',
  icons: [
    {
      rel: 'icon',
      url: '/models/cat12.png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/models/cat12.png',
    },
  ],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Human DeFi',
  },
  openGraph: {
    title: 'Human DeFi: La plataforma líder',
    description: 'La plataforma líder de activos soberanos.',
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
        <head>
           <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-52B9SCRM');`
            }}
          />
        </head>
        <body className={inter.className}>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-52B9SCRM"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`
            }}
          />
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
