import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog — OkeTech",
  description: "Actualités et conseils OkeTech pour les talents, investisseurs et entreprises.",
}

const articles = [
  {
    categorie: "Développeurs",
    titre: "Présenter un projet qui donne confiance",
    texte: "Un bon projet explique clairement le problème, la solution, le marché, le budget et les prochaines étapes.",
  },
  {
    categorie: "Investisseurs",
    titre: "Lire un dossier projet sans perdre de temps",
    texte: "OkeTech met en avant les informations utiles : score, financement, secteur, équipe et potentiel.",
  },
  {
    categorie: "Entreprises",
    titre: "Trouver rapidement un talent tech fiable",
    texte: "Les profils structurés facilitent la sélection, le contact et la collaboration.",
  },
]

export default function BlogPage() {
  return (
    <main className="bg-light">
      <section className="bg-dark px-6 py-20 text-white sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1120px]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Blog</p>
          <h1 className="mt-5 max-w-3xl text-[36px] font-bold leading-tight sm:text-[48px]">
            Des idées simples pour avancer plus vite.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            Conseils courts, pratiques et orientés action pour mieux utiliser OkeTech.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-[1120px] gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <article key={article.titre} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{article.categorie}</p>
              <h2 className="mt-4 text-xl font-bold leading-tight text-dark">{article.titre}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{article.texte}</p>
              <Link href="/inscription" className="mt-6 inline-flex text-sm font-semibold text-primary">
                Passer à l&apos;action →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
