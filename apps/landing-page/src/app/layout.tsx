import type { Metadata } from "next";
import { WalletProvider } from '@/components/WalletProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Whale Network | Powered by Aztec",
  description: "The Private Plaza for Ethereum. Build and transact with total confidentiality using Noir and Zero-Knowledge proofs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col font-sans">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
