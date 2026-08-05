import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "À propos — OkeTech",
  description: "Découvrez la mission, les conditions et les informations légales de la plateforme OkeTech.",
}

const valeurs = [
  {
    titre: "Mettre les talents en lumière",
    texte: "OkeTech aide les développeurs africains à présenter leurs compétences, leurs projets et leur potentiel devant des partenaires sérieux.",
  },
  {
    titre: "Créer de la confiance",
    texte: "La plateforme structure les profils, les projets, les dossiers et les échanges pour rendre chaque mise en relation plus claire.",
  },
  {
    titre: "Accélérer les collaborations",
    texte: "Investisseurs, entreprises et développeurs disposent d'un espace commun pour avancer plus vite, avec des informations utiles au bon moment.",
  },
]

export default function AProposPage() {
  return (
    <main className="bg-light">
      <section className="bg-dark px-6 py-20 text-white sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1120px]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">À propos</p>
          <h1 className="mt-5 max-w-3xl text-[36px] font-bold leading-tight sm:text-[48px]">
            OkeTech connecte les talents africains aux opportunités qui les font grandir.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            La plateforme rassemble développeurs, investisseurs et entreprises autour de projets tech concrets,
            avec une logique simple : rendre les bons profils visibles, crédibles et accessibles.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-[1120px] gap-5 md:grid-cols-3">
          {valeurs.map((valeur) => (
            <article key={valeur.titre} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-dark">{valeur.titre}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{valeur.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-[1120px] gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Conditions générales</p>
            <h2 className="mt-3 text-2xl font-bold text-dark">Utilisation de la plateforme</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              En créant un compte, l&apos;utilisateur s&apos;engage à fournir des informations exactes, à respecter les autres
              membres de la plateforme et à ne publier que des projets, offres ou messages liés à l&apos;écosystème tech.
              Les accès payants aux dossiers, les commissions et les options premium sont encadrés par les règles
              commerciales d&apos;OkeTech.
            </p>
          </article>

          <article className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Contact</p>
            <h2 className="mt-3 text-2xl font-bold text-dark">Échanger avec OkeTech</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Pour une question, une collaboration ou une demande liée à la plateforme, contactez l&apos;équipe depuis la messagerie
              une fois connecté.
            </p>
            <Link href="/inscription" className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white">
              Rejoindre OkeTech
            </Link>
          </article>
        </div>
      </section>
    </main>
  )
}
