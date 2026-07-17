"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navigation = [
  { href: "/projets", label: "Projets" },
  { href: "/developpeurs", label: "Développeurs" },
  { href: "/investisseurs", label: "Investisseurs" },
  { href: "/entreprises", label: "Entreprises" },
  { href: "/a-propos", label: "À propos" },
]

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#16A34A] text-[#16A34A]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 3.5 15 6l3.8-.2.7 3.8L22 12l-2.5 2.4-.7 3.8-3.8-.2-3 2.5L9 18l-3.8.2-.7-3.8L2 12l2.5-2.4.7-3.8L9 6l3-2.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      <span className="text-2xl font-black tracking-[-0.02em] text-[#0F172A]">
        Oke<span className="text-[#16A34A]">Tech</span>
      </span>
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [menuOuvert, setMenuOuvert] = useState(false)

  const linkClass = (href: string) =>
    `text-sm font-semibold transition-colors ${
      pathname === href ? "text-[#16A34A]" : "text-[#111827] hover:text-[#16A34A]"
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="shrink-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-4"
          aria-label="OkeTech - Accueil"
          onClick={() => setMenuOuvert(false)}
        >
          <Logo />
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/connexion"
            className="inline-flex h-11 min-w-32 items-center justify-center rounded-md border border-[#16A34A] px-5 text-sm font-bold text-[#15803D] transition-colors hover:bg-[#F0FDF4]"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="inline-flex h-11 min-w-32 items-center justify-center rounded-md bg-[#15803D] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#166534]"
          >
            S&apos;inscrire
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-md text-slate-900 transition-colors hover:bg-slate-100 md:hidden"
          aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOuvert}
          aria-controls="menu-mobile"
          onClick={() => setMenuOuvert((ouvert) => !ouvert)}
        >
          <span className="sr-only">{menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}</span>
          {menuOuvert ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {menuOuvert && (
        <div id="menu-mobile" className="border-t border-slate-200 bg-white px-5 py-5 shadow-lg md:hidden">
          <div className="grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-3 text-sm font-semibold ${
                  pathname === item.href ? "bg-[#F0FDF4] text-[#16A34A]" : "text-slate-900"
                }`}
                onClick={() => setMenuOuvert(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
            <Link
              href="/connexion"
              className="inline-flex h-11 items-center justify-center rounded-md border border-[#16A34A] text-sm font-bold text-[#15803D]"
              onClick={() => setMenuOuvert(false)}
            >
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#15803D] text-sm font-bold text-white"
              onClick={() => setMenuOuvert(false)}
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
