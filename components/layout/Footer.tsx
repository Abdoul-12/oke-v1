import Link from "next/link"

const platformLinks = [
  { href: "/projets", label: "Projets" },
  { href: "/developpeurs", label: "Développeurs" },
  { href: "/investisseurs", label: "Investisseurs" },
  { href: "/entreprises", label: "Entreprises" },
  { href: "/a-propos", label: "À propos" },
]

const resourceLinks = ["Blog", "Guides", "FAQ", "Webinaires", "Centre d'aide"]
const legalLinks = ["Conditions d'utilisation", "Politique de confidentialité", "Mentions légales"]

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#22C55E] text-[#22C55E]">
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
      <span className="text-2xl font-black text-white">
        Oke<span className="text-[#22C55E]">Tech</span>
      </span>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#061727] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_1fr] lg:px-10">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
            La plateforme qui connecte les talents, les idées et les investissements pour bâtir l&apos;Afrique de demain.
          </p>
          <div className="mt-5 flex gap-3">
            {["f", "x", "in", "ig"].map((item) => (
              <Link
                key={item}
                href="/"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-bold text-white transition-colors hover:bg-[#22C55E]"
                aria-label={`OkeTech ${item}`}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold">Plateforme</h3>
          <div className="mt-4 grid gap-3">
            {platformLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-sm text-slate-300 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold">Ressources</h3>
          <div className="mt-4 grid gap-3">
            {resourceLinks.map((label) => (
              <Link key={label} href="/a-propos" className="text-sm text-slate-300 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold">Légal</h3>
          <div className="mt-4 grid gap-3">
            {legalLinks.map((label) => (
              <Link key={label} href="/a-propos" className="text-sm text-slate-300 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold">Newsletter</h3>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Restez informé de nos dernières actualités et opportunités.
          </p>
          <form className="mt-5 flex overflow-hidden rounded-md bg-white/10">
            <label htmlFor="newsletter-email" className="sr-only">
              Votre email
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Votre email"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="grid w-12 place-items-center bg-[#16A34A] text-white" aria-label="S'inscrire">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      <p className="border-t border-white/10 px-5 py-5 text-center text-sm text-slate-400">
        © 2024 OkeTech. Tous droits réservés.
      </p>
    </footer>
  )
}
