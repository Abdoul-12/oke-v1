import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mentions légales — OkeTech",
  description: "Informations légales de la plateforme OkeTech.",
}

const infos = [
  { label: "Nom du projet", valeur: "OkeTech" },
  { label: "Porteur", valeur: "Bakary Abdul Wadud" },
  { label: "Localisation", valeur: "Libreville, Gabon" },
  { label: "Objet", valeur: "Plateforme de mise en relation entre développeurs, investisseurs et entreprises." },
]

export default function MentionsLegalesPage() {
  return (
    <main className="bg-light">
      <section className="bg-dark px-6 py-20 text-white sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1120px]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Mentions légales</p>
          <h1 className="mt-5 max-w-3xl text-[36px] font-bold leading-tight sm:text-[48px]">
            Informations officielles OkeTech.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            Cette page présente les informations essentielles liées au projet et à son exploitation.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[900px] overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          {infos.map((info) => (
            <div key={info.label} className="grid gap-2 border-b border-border px-6 py-5 last:border-b-0 sm:grid-cols-[220px_1fr]">
              <p className="text-sm font-bold text-dark">{info.label}</p>
              <p className="text-sm leading-7 text-muted">{info.valeur}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
