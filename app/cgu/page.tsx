import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CGU — OkeTech",
  description: "Conditions générales d'utilisation de la plateforme OkeTech.",
}

const regles = [
  {
    titre: "Compte utilisateur",
    texte: "Chaque utilisateur doit fournir des informations exactes et garder son accès personnel confidentiel.",
  },
  {
    titre: "Projets et contenus",
    texte: "Les projets, offres et messages publiés doivent être sérieux, professionnels et liés à l'écosystème tech.",
  },
  {
    titre: "Accès aux dossiers",
    texte: "L'accès à un dossier complet est réservé aux investisseurs ayant validé les conditions prévues par OkeTech.",
  },
  {
    titre: "Respect des échanges",
    texte: "Les discussions doivent rester professionnelles. Toute utilisation abusive peut entraîner une restriction de compte.",
  },
]

export default function CguPage() {
  return (
    <main className="bg-light">
      <section className="bg-dark px-6 py-20 text-white sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1120px]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">CGU</p>
          <h1 className="mt-5 max-w-3xl text-[36px] font-bold leading-tight sm:text-[48px]">
            Des règles simples pour une plateforme fiable.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            Ces conditions cadrent l&apos;utilisation d&apos;OkeTech pour protéger les développeurs, les investisseurs et les entreprises.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-[1120px] gap-5 md:grid-cols-2">
          {regles.map((regle) => (
            <article key={regle.titre} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-dark">{regle.titre}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{regle.texte}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
