import Link from 'next/link'
import Image from 'next/image'
import PublicAuthLink from '@/components/ui/PublicAuthLink'
import { getProfilsPublics } from '@/lib/profiles/public'

const stats = [
  { value: '1000+', label: 'Développeurs inscrits' },
  { value: '500+', label: 'Projets soumis' },
  { value: '150+', label: 'Investisseurs actifs' },
  { value: '10+', label: 'Pays connectés' },
]

const avantages = [
  {
    icon: '</>',
    title: 'Profil professionnel',
    description:
      'Créez un profil crédible avec score de confiance visible par tous les investisseurs.',
  },
  {
    icon: '↥',
    title: 'Visibilité investisseurs',
    description:
      'Faites remonter vos projets auprès des investisseurs actifs qui cherchent des opportunités crédibles.',
  },
  {
    icon: '✓',
    title: 'Score de crédibilité',
    description:
      'Un algorithme transparent qui valorise vos compétences et votre sérieux.',
  },
  {
    icon: '▣',
    title: 'Dossier projet complet',
    description:
      'Structurez vos idées avec les informations clés attendues par les partenaires.',
  },
  {
    icon: '✉',
    title: 'Messagerie sécurisée',
    description:
      'Échangez avec investisseurs et entreprises dans un espace professionnel protégé.',
  },
  {
    icon: '↗',
    title: 'Réseau professionnel',
    description:
      "Développez des relations utiles avec l'écosystème tech africain.",
  },
]

const particlePositions = [
  'left-[4%] top-[18%]',
  'left-[14%] top-[62%]',
  'left-[24%] top-[16%]',
  'left-[33%] top-[58%]',
  'left-[41%] top-[28%]',
  'left-[52%] top-[18%]',
  'left-[61%] top-[60%]',
  'left-[72%] top-[19%]',
  'left-[82%] top-[62%]',
  'left-[95%] top-[18%]',
  'left-[8%] top-[78%]',
  'left-[28%] top-[80%]',
  'left-[43%] top-[82%]',
  'left-[57%] top-[80%]',
  'left-[75%] top-[82%]',
  'left-[88%] top-[81%]',
]

function ParticleField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particlePositions.map((position, index) => (
        <span
          key={position}
          className={[
            'absolute flex h-8 w-3 flex-col gap-1',
            position,
            index % 2 === 0 ? 'rotate-[-18deg]' : 'rotate-[24deg]',
          ].join(' ')}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
        </span>
      ))}
    </div>
  )
}

export default async function DeveloppeursPage() {
  const developpeurs = await getProfilsPublics('developpeur', 12)

  return (
    <main className="bg-white text-dark">
      <section className="relative overflow-hidden bg-[#050D2D] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20">
        <ParticleField />

        <div className="relative mx-auto flex max-w-[1180px] flex-col items-center text-center">
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Ton profil ne doit plus rester invisible.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Présente tes compétences, publie tes projets et deviens visible auprès des investisseurs
            et entreprises qui cherchent déjà des talents africains sérieux.
          </p>

          <div className="mt-8 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
            <PublicAuthLink
              visiteurLabel="Créer mon profil gratuitement"
              connecteLabel="Accéder à mon espace"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-secondary px-10 text-sm font-semibold text-white transition hover:bg-secondary/90"
            />
            <Link
              href="/projets"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white px-10 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
            >
              Découvrir les projets
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1520px] grid-cols-2 divide-x divide-border py-5 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-2 text-center">
              <p className="text-lg font-bold text-primary">{stat.value}</p>
              <p className="mt-2 text-xs font-medium text-muted sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1520px]">
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-bold text-dark sm:text-3xl">
              Tout ce qu&apos;il vous faut pour réussir
            </h2>
          </div>

          <div className="mt-11 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {avantages.map((avantage) => (
              <article
                key={avantage.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-sm font-bold text-secondary">
                    {avantage.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark">{avantage.title}</h3>
                    <p className="mt-6 text-sm leading-7 text-muted">{avantage.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1520px]">
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-bold text-dark sm:text-3xl">
              Découvrez les talents de la plateforme
            </h2>
          </div>

          {developpeurs.length === 0 ? (
            <div className="mt-10 rounded-xl border border-border bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-bold text-dark">Aucun développeur inscrit pour le moment</h3>
              <p className="mx-auto mt-3 max-w-[460px] text-sm leading-6 text-muted">
                Les comptes développeur créés sur OkeTech apparaîtront ici automatiquement.
              </p>
              <PublicAuthLink
                visiteurLabel="Créer le premier profil"
                connecteLabel="Accéder à mon espace"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-secondary px-6 text-sm font-semibold text-white transition hover:bg-secondary/90"
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {developpeurs.map((developpeur) => (
                <article
                  key={developpeur.id}
                  className="relative rounded-xl border border-border bg-white p-6 text-center shadow-sm"
                >
                  {(developpeur.verifie || developpeur.premium) && (
                    <span className="absolute right-5 top-5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {developpeur.premium ? 'Premium' : 'Vérifié'}
                    </span>
                  )}

                  <div
                    className={`mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ${developpeur.couleur} text-sm font-semibold text-white`}
                  >
                    {developpeur.avatarUrl ? (
                      <Image src={developpeur.avatarUrl} alt="" width={80} height={80} unoptimized className="h-full w-full object-cover" />
                    ) : (
                      developpeur.initiales
                    )}
                  </div>
                  <h3 className="mt-6 text-base font-bold text-dark">{developpeur.nomComplet}</h3>
                  <p className="mt-2 text-sm text-muted">{developpeur.titre}</p>
                  <p className="mt-2 text-xs font-medium text-muted">{developpeur.pays}</p>
                  <p className="mt-4 min-h-12 text-sm leading-6 text-muted">
                    {developpeur.bio || 'Profil en cours de finalisation.'}
                  </p>

                  <div className="mt-5 flex min-h-8 flex-wrap justify-center gap-2">
                    {developpeur.skills.length > 0 ? (
                      developpeur.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">
                        Compétences à compléter
                      </span>
                    )}
                  </div>

                  <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium">
                      <span className="text-muted">Score</span>
                      <span className="text-primary">{developpeur.score}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200">
                      <div className={`h-full rounded-full bg-primary ${developpeur.progressionClasse}`} />
                    </div>
                  </div>

                  <Link
                    href={`/messagerie?destinataire=${developpeur.id}`}
                    className="mt-6 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-primary px-4 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    Contacter ce profil
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-secondary px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <p className="text-base font-semibold sm:text-lg">
            Rejoins OkeTech et transforme ta carrière dès aujourd&apos;hui
          </p>
          <PublicAuthLink
            visiteurLabel="Créer mon profil"
            connecteLabel="Accéder à mon espace"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-12 text-sm font-semibold text-secondary transition hover:bg-slate-100 sm:w-auto"
          />
        </div>
      </section>
    </main>
  )
}
