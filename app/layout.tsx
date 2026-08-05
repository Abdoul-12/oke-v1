import type { Metadata } from "next"
import "./globals.css"
import AppChrome from "@/components/layout/AppChrome"

export const metadata: Metadata = {
  title: "OkeTech — Élevons les développeurs africains au sommet",
  description: "OkeTech connecte les développeurs africains aux investisseurs et aux entreprises.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 min-h-screen flex flex-col">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  )
}
