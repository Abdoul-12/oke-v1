import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact — OkeTech",
  description: "Contactez OkeTech pour une question, une collaboration ou un accompagnement.",
}

const contacts = [
  { titre: "Développeur", texte: "Besoin d'aide pour publier un projet ou compléter votre profil." },
  { titre: "Investisseur", texte: "Question sur l'accès aux dossiers, les projets ou les mises en relation." },
  { titre: "Entreprise", texte: "Besoin d'informations pour recruter ou publier une offre." },
]

export default function ContactPage() {
  return (
    <main className="bg-light">
      <section className="bg-dark px-6 py-20 text-white sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1120px]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Contact</p>
          <h1 className="mt-5 max-w-3xl text-[36px] font-bold leading-tight sm:text-[48px]">
            Parlons de votre besoin sur OkeTech.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            Une question, un projet, un recrutement ou une collaboration ? OkeTech vous oriente vers le bon espace.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-[1120px] gap-5 md:grid-cols-3">
          {contacts.map((contact) => (
            <article key={contact.titre} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-dark">{contact.titre}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{contact.texte}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[1120px] flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-dark">Rejoindre la plateforme</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Créez un compte et accédez à l&apos;espace adapté à votre profil.</p>
          </div>
          <Link href="/inscription" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white">
            Créer un compte
          </Link>
        </div>
      </section>
    </main>
  )
}
