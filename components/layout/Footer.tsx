"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const colonnes = [
  {
    titre: "Plateforme",
    liens: [
      { href: "/projets", label: "Projets" },
      { href: "/developpeurs", label: "Développeurs" },
      { href: "/investisseurs", label: "Investisseurs" },
      { href: "/entreprises", label: "Entreprises" },
    ],
  },
  {
    titre: "Société",
    liens: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    titre: "Légal",
    liens: [
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
      { href: "/mentions-legales", label: "Mentions légales" },
    ],
  },
]

function estLienActif(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="border-t border-white/10 bg-dark text-white">
      <div className="mx-auto w-full max-w-[1760px] px-6 py-8 sm:px-8 md:px-12 md:py-9 lg:px-12 2xl:px-20">
        <div className="grid gap-7 sm:grid-cols-2 md:gap-10 lg:grid-cols-[1.6fr_0.85fr_0.85fr_0.85fr] lg:gap-14">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-2" aria-label="Accueil OkeTech">
              <span className="flex h-9 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm shadow-primary/25 transition-transform duration-200 group-hover:-translate-y-0.5">
                OKE
              </span>
              <span className="text-xl font-bold text-white">Tech</span>
            </Link>

            <p className="mt-4 max-w-[340px] text-sm leading-6 text-slate-400">
              La plateforme qui connecte les développeurs africains aux investisseurs et aux entreprises.
            </p>
          </div>

          {colonnes.map((colonne) => (
            <div key={colonne.titre} className="min-w-0">
              <h3 className="text-sm font-bold leading-none text-white">{colonne.titre}</h3>
              <nav className="mt-4" aria-label={colonne.titre}>
                <ul className="flex flex-col gap-2">
                  {colonne.liens.map((lien) => (
                    <li key={`${colonne.titre}-${lien.label}`}>
                      {(() => {
                        const actif = estLienActif(pathname, lien.href)

                        return (
                          <Link
                            href={lien.href}
                            aria-current={actif ? "page" : undefined}
                            className={`inline-flex rounded-md py-1 text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                              actif ? "font-semibold text-primary" : "text-slate-400 hover:text-primary"
                            }`}
                          >
                            {lien.label}
                          </Link>
                        )
                      })()}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-7 border-t border-white/10 pt-4 text-center">
          <p className="mx-auto max-w-[520px] text-xs leading-5 text-slate-500">
            © 2025 OkeTech. Tous droits réservés. — Fait avec passion en Afrique 🌍
          </p>
        </div>
      </div>
    </footer>
  )
}
