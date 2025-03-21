import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryClientProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SwiftClaim - Instant Insurance Claims',
  description: 'Get instant payouts for your insurance claims',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
} 