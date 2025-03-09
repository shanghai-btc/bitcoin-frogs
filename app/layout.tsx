import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { GifScriptLoader } from "./components/gif-script-loader"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <GifScriptLoader />
        {children}
      </body>
    </html>
  )
}

