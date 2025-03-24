import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import '../globals.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NexaFX - Create Your Account",
  description: "Join NexaFX to start exchanging currencies with ease",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

