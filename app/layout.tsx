import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import { Amplify } from 'aws-amplify'
import config from '../src/amplifyconfiguration.json'

Amplify.configure(config, { ssr: true })

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "SocialConnect - Connect with friends",
  description: "A modern social networking app inspired by Facebook",
  generator: "v0.app",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${playfairDisplay.variable} ${sourceSans.variable} antialiased overflow-x-hidden w-full max-w-full`} suppressHydrationWarning>
      <body className="overflow-x-hidden w-full max-w-full m-0 p-0" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
