"use client"

import { usePathname } from "next/navigation"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import NavigationProgress from "@/components/layout/NavigationProgress"

const routesSansChrome = ["/connexion", "/inscription", "/mot-de-passe-oublie"]
const routesApplication = ["/dashboard", "/messagerie", "/profil", "/paiement"]

interface AppChromeProps {
  children: React.ReactNode
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname()
  const masquerChrome = routesSansChrome.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const pageApplication = routesApplication.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (masquerChrome) {
    return (
      <>
        <NavigationProgress />
        {children}
      </>
    )
  }

  return (
    <>
      <NavigationProgress />
      <Navbar />
      <div className="flex-1">{children}</div>
      {!pageApplication && <Footer />}
    </>
  )
}
