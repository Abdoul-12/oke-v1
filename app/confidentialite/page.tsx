import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Confidentialité — OkeTech",
  description: "Politique de confidentialité de la plateforme OkeTech.",
}

const points = [
  "OkeTech collecte uniquement les informations nécessaires à la création du compte, au profil et aux mises en relation.",
  "Les données sensibles liées aux dossiers de projets sont protégées et accessibles selon les règles prévues par la plateforme.",
  "Les informations de connexion sont gérées par Supabase Auth et ne sont pas stockées en clair dans l'application.",
  "L'utilisateur peut demander la correction ou la suppression de ses informations selon les conditions applicables.",
]

export default function ConfidentialitePage() {
  return (
    <main className="bg-light">
      <section className="bg-dark px-6 py-20 text-white sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1120px]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Confidentialité</p>
          <h1 className="mt-5 max-w-3xl text-[36px] font-bold leading-tight sm:text-[48px]">
            Vos données doivent rester utiles, protégées et maîtrisées.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            OkeTech utilise les données pour faire fonctionner la plateforme, sécuriser les comptes et faciliter les connexions professionnelles.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[900px] rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-dark">Principes de protection</h2>
          <ul className="mt-6 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-7 text-muted">
                <span className="mt-1 text-primary">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
