import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shelby Vault — Decentralized Image Host on Aptos',
  description: 'Upload images to Shelby decentralized hot storage. Powered by Aptos blockchain.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
