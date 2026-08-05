import Link from 'next/link'
import Image from 'next/image'
import PublicAuthLink from '@/components/ui/PublicAuthLink'
import { getProfilsPublics } from '@/lib/profiles/public'

const stats = [
  { value: '1000+', label: 'Développeurs disponibles' },
  { value: '500+', label: 'Projets réalisés' },
  { value: '50+', label: 'Entreprises partenaires' },
  { value: '10+', label: 'Pays couverts' },
]

const avantages = [
  {
    icon: '✓',
    title: 'Talents vérifiés et scorés',
    description:
      'Accédez à des développeurs avec un score de crédibilité transparent.',
  },
  {
    icon: '⌕',
    title: 'Recherche ciblée',
    description:
      'Filtrez par compétences, pays, disponibilité et score facilement.',
  },
  {
    icon: '▣',
    title: "Publication d'offres",
    description:
      'Publiez vos offres en quelques clics et recevez des candidatures qualifiées.',
  },
  {
    icon: '↗',
    title: 'Offres sponsorisées',
    description:
      'Mettez vos besoins en avant pour attirer rapidement les meilleurs profils.',
  },
  {
    icon: '✉',
    title: 'Messagerie sécurisée',
    description:
      'Contactez les talents directement et suivez vos conversations au même endroit.',
  },
  {
    icon: '●',
    title: 'Profils recommandés',
    description:
      'Identifiez les profils les plus adaptés à vos besoins de recrutement.',
  },
]

const particlePositions = [
  'left-[3%] top-[14%]',
  'left-[10%] top-[35%]',
  'left-[17%] top-[59%]',
  'left-[24%] top-[26%]',
  'left-[31%] top-[72%]',
  'left-[39%] top-[10%]',
  'left-[47%] top-[35%]',
  'left-[55%] top-[59%]',
  'left-[63%] top-[14%]',
  'left-[71%] top-[38%]',
  'left-[79%] top-[62%]',
  'left-[87%] top-[18%]',
  'left-[95%] top-[48%]',
  'left-[99%] top-[23%]',
  'left-[8%] top-[78%]',
  'left-[20%] top-[52%]',
  'left-[52%] top-[9%]',
  'left-[68%] top-[7%]',
  'left-[84%] top-[73%]',
  'left-[97%] top-[67%]',
]

function ParticleField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particlePositions.map((position, index) => (
        <span
          key={position}
          className={[
            'absolute block rounded-full bg-violet-500',
            position,
            index % 3 === 0 ? 'h-2.5 w-2.5' : 'h-1.5 w-1.5',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

export default async function EntreprisesPage() {
  const entreprises = await getProfilsPublics('entreprise', 12)

  return (
    <main className="bg-white text-dark">
      <section className="relative overflow-hidden bg-[#050D2D] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20">
        <ParticleField />

        <div className="relative mx-auto flex max-w-[1180px] flex-col items-center text-center">
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Recrutez des talents tech africains sans perdre des semaines à chercher.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Accédez à des profils vérifiés, comparez les compétences, contactez les meilleurs
            candidats et lancez vos collaborations depuis un même espace.
          </p>

          <div className="mt-8 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
            <PublicAuthLink
              visiteurLabel="Créer mon compte entreprise"
              connecteLabel="Accéder à mon espace"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-violet-600 px-10 text-sm font-semibold text-white transition hover:bg-violet-700"
            />
            <Link
              href="/developpeurs"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white px-10 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
            >
              Explorer les talents
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1760px] grid-cols-2 divide-x divide-border py-5 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-2 text-center">
              <p className="text-lg font-bold text-violet-600">{stat.value}</p>
              <p className="mt-2 text-xs font-medium text-muted sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1760px]">
          <div className="text-center">

            <h2 className="mt-4 text-2xl font-bold text-dark sm:text-3xl">
              Tout ce qu&apos;il vous faut pour recruter les meilleurs
            </h2>
          </div>

          <div className="mt-11 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {avantages.map((avantage) => (
              <article
                key={avantage.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600">
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
        <div className="mx-auto max-w-[1760px]">
          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
              Entreprises inscrites
            </p>
            <h2 className="mt-4 text-2xl font-bold text-dark sm:text-3xl">
              Les organisations présentes dans l&apos;écosystème OkeTech
            </h2>
          </div>

          {entreprises.length === 0 ? (
            <div className="mt-10 rounded-xl border border-border bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-bold text-dark">Aucune entreprise inscrite pour le moment</h3>
              <p className="mx-auto mt-3 max-w-[460px] text-sm leading-6 text-muted">
                Les comptes entreprise créés sur OkeTech apparaîtront ici automatiquement.
              </p>
              <PublicAuthLink
                visiteurLabel="Créer un compte entreprise"
                connecteLabel="Accéder à mon espace"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700"
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {entreprises.map((entreprise) => (
                <article
                  key={entreprise.id}
                  className="relative rounded-xl border border-border bg-white p-6 text-center shadow-sm"
                >
                  {(entreprise.verifie || entreprise.premium) && (
                    <span className="absolute right-5 top-5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-600">
                      {entreprise.premium ? 'Premium' : 'Vérifié'}
                    </span>
                  )}

                  <div
                    className={`mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ${entreprise.couleur} text-sm font-semibold text-white`}
                  >
                    {entreprise.avatarUrl ? (
                      <Image src={entreprise.avatarUrl} alt="" width={80} height={80} unoptimized className="h-full w-full object-cover" />
                    ) : (
                      entreprise.initiales
                    )}
                  </div>
                  <h3 className="mt-6 text-base font-bold text-dark">{entreprise.nomComplet}</h3>
                  <p className="mt-2 text-sm text-muted">{entreprise.titre}</p>
                  <p className="mt-2 text-xs font-medium text-muted">{entreprise.pays}</p>
                  <p className="mt-4 min-h-12 text-sm leading-6 text-muted">
                    {entreprise.bio || 'Profil entreprise en cours de finalisation.'}
                  </p>

                  <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium">
                      <span className="text-muted">Score crédibilité</span>
                      <span className="text-primary">{entreprise.score}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200">
                      <div className={`h-full rounded-full bg-primary ${entreprise.progressionClasse}`} />
                    </div>
                  </div>

                  <Link
                    href={`/messagerie?destinataire=${entreprise.id}`}
                    className="mt-6 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-violet-600 px-4 text-sm font-semibold text-violet-600 transition hover:bg-violet-600 hover:text-white"
                  >
                    Contacter
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-violet-600 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1760px] flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <p className="text-base font-semibold sm:text-lg">
            Rejoins OkeTech et trouve les talents qu&apos;il te faut dès aujourd&apos;hui
          </p>
          <PublicAuthLink
            visiteurLabel="Créer mon compte"
            connecteLabel="Accéder à mon espace"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-12 text-sm font-semibold text-violet-600 transition hover:bg-slate-100 sm:w-auto"
          />
        </div>
      </section>
    </main>
  )
}
