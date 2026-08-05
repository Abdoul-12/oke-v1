"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { dashboardParRole, isRoleUtilisateur, type RoleUtilisateur } from "@/lib/auth/roles"

const liens = [
  { href: "/projets", label: "Projets" },
  { href: "/developpeurs", label: "Développeurs" },
  { href: "/investisseurs", label: "Investisseurs" },
  { href: "/entreprises", label: "Entreprises" },
  { href: "/a-propos", label: "À propos" },
]

const boutonBase =
  "inline-flex h-11 min-w-36 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"

const boutonConnexion =
  `${boutonBase} border border-primary bg-white text-primary shadow-sm hover:bg-primary hover:text-white hover:shadow-md`

const boutonInscription =
  `${boutonBase} bg-primary text-white shadow-sm shadow-primary/20 hover:bg-[#0c7468] hover:shadow-md hover:shadow-primary/25`

export default function Navbar() {
  const pathname = usePathname()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [role, setRole] = useState<RoleUtilisateur | null>(null)
  const [sessionChargee, setSessionChargee] = useState(false)
  const pagePrivee =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profil") ||
    pathname.startsWith("/messagerie") ||
    pathname.startsWith("/paiement")

  useEffect(() => {
    let actif = true

    async function chargerSession() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!actif) return

      if (!user) {
        setRole(null)
        setSessionChargee(true)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      setRole(isRoleUtilisateur(profile?.role) ? profile.role : null)
      setSessionChargee(true)
    }

    void chargerSession()

    return () => {
      actif = false
    }
  }, [pathname])

  const dashboardHref = role ? dashboardParRole(role) : "/connexion"
  const connecte = Boolean(role)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur">
      <nav
        className="mx-auto flex h-[72px] w-full max-w-[1520px] items-center justify-between px-6 sm:px-8 md:px-12 lg:px-12 2xl:px-16"
        aria-label="Navigation principale"
      >
        <Link href="/" className="group flex items-center gap-2" aria-label="Accueil OkeTech">
          <span className="flex h-9 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm shadow-primary/25 transition-transform duration-200 group-hover:-translate-y-0.5">
            OKE
          </span>
          <span className="text-xl font-bold text-dark">Tech</span>
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {liens.map((lien) => (
            <li key={lien.href}>
              <Link
                href={lien.href}
                className="relative inline-flex py-2 text-sm font-semibold text-muted transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-200 hover:text-primary hover:after:w-full"
              >
                {lien.label}
              </Link>
            </li>
          ))}
        </ul>

        {pagePrivee || !sessionChargee ? (
          <div className="hidden min-w-[304px] md:block" aria-hidden="true" />
        ) : connecte ? (
          <div className="hidden items-center gap-4 md:flex">
            <Link href={dashboardHref} className={boutonInscription}>
              Mon espace
            </Link>
          </div>
        ) : (
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/connexion" className={boutonConnexion}>
              Se connecter
            </Link>
            <Link href="/inscription" className={boutonInscription}>
              S&apos;inscrire
            </Link>
          </div>
        )}

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-dark shadow-sm transition-colors hover:border-primary hover:text-primary md:hidden"
          onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOuvert}
        >
          <span className="text-xl leading-none">{menuOuvert ? "×" : "☰"}</span>
        </button>
      </nav>

      {menuOuvert && (
        <div className="border-t border-border bg-white shadow-lg shadow-slate-900/5 md:hidden">
          <div className="mx-auto w-full max-w-[1520px] px-6 py-5 sm:px-8 md:px-12 lg:px-12 2xl:px-16">
            <ul className="flex flex-col gap-4" aria-label="Navigation mobile">
              {liens.map((lien) => (
                <li key={lien.href}>
                  <Link
                    href={lien.href}
                    className="flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                    onClick={() => setMenuOuvert(false)}
                  >
                    {lien.label}
                  </Link>
                </li>
              ))}
            </ul>

            {!pagePrivee && connecte && (
              <div className="mt-5 grid gap-3 border-t border-border pt-5">
                <Link
                  href={dashboardHref}
                  className={`${boutonInscription} w-full`}
                  onClick={() => setMenuOuvert(false)}
                >
                  Mon espace
                </Link>
              </div>
            )}

            {!pagePrivee && !connecte && sessionChargee && (
              <div className="mt-5 grid gap-3 border-t border-border pt-5">
                <Link
                  href="/connexion"
                  className={`${boutonConnexion} w-full`}
                  onClick={() => setMenuOuvert(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  className={`${boutonInscription} w-full`}
                  onClick={() => setMenuOuvert(false)}
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
