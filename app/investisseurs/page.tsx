import Link from 'next/link'
import Image from 'next/image'
import PublicAuthLink from '@/components/ui/PublicAuthLink'
import { getProjetsPublics } from '@/lib/projects/public'
import { getProfilsPublics } from '@/lib/profiles/public'

const stats = [
  { value: '500+', label: 'Projets disponibles' },
  { value: '25 000', label: 'FCFA par dossier' },
  { value: '1000+', label: 'Développeurs vérifiés' },
  { value: '10+', label: 'Pays couverts' },
]

const avantages = [
  {
    icon: '✓',
    title: 'Projets filtrés et vérifiés',
    description:
      'Accédez aux projets les mieux scorés, vérifiés et prêts à être financés.',
  },
  {
    icon: '▣',
    title: 'Dossiers financiers complets',
    description:
      'Business Plan, prévisions financières, architecture technique et tout inclus.',
  },
  {
    icon: '⌁',
    title: 'Contrats sécurisés',
    description:
      'Collaborez en toute confiance avec des contrats numériques horodatés.',
  },
  {
    icon: '✉',
    title: 'Messagerie directe',
    description:
      'Échangez directement avec les développeurs et porteurs de projets.',
  },
  {
    icon: '↗',
    title: 'Dashboard de suivi',
    description:
      'Suivez vos accès dossiers, vos projets favoris et vos échanges actifs.',
  },
  {
    icon: '●',
    title: 'Accès prioritaire',
    description:
      'Identifiez rapidement les projets prometteurs avant leur financement complet.',
  },
]

const particlePositions = [
  'left-[2%] top-[15%]',
  'left-[9%] top-[35%]',
  'left-[16%] top-[58%]',
  'left-[22%] top-[25%]',
  'left-[29%] top-[74%]',
  'left-[36%] top-[9%]',
  'left-[42%] top-[31%]',
  'left-[51%] top-[58%]',
  'left-[58%] top-[14%]',
  'left-[66%] top-[34%]',
  'left-[74%] top-[63%]',
  'left-[83%] top-[18%]',
  'left-[91%] top-[49%]',
  'left-[98%] top-[22%]',
  'left-[6%] top-[78%]',
  'left-[25%] top-[52%]',
  'left-[48%] top-[10%]',
  'left-[70%] top-[7%]',
  'left-[86%] top-[73%]',
  'left-[96%] top-[67%]',
]

function ParticleField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particlePositions.map((position, index) => (
        <span
          key={position}
          className={[
            'absolute block rounded-full bg-primary',
            position,
            index % 3 === 0 ? 'h-2.5 w-2.5' : 'h-1.5 w-1.5',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

export default async function InvestisseursPage() {
  const projets = await getProjetsPublics(4)
  const investisseurs = await getProfilsPublics('investisseur', 12)

  return (
    <main className="bg-white text-dark">
      <section className="relative overflow-hidden bg-[#050D2D] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20">
        <ParticleField />

        <div className="relative mx-auto flex max-w-[1180px] flex-col items-center text-center">
          <span className="mb-7 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm">
            Espace Investisseurs · Opportunités vérifiées
          </span>

          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Repérez les projets africains avant qu&apos;ils ne deviennent évidents.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Consultez des projets présentés clairement, analysez leur crédibilité et débloquez les
            dossiers complets quand une opportunité mérite votre attention.
          </p>

          <div className="mt-8 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
            <PublicAuthLink
              visiteurLabel="Créer mon compte investisseur"
              connecteLabel="Accéder à mon espace"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-10 text-sm font-semibold text-white transition hover:bg-primary/90"
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
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Vos avantages
            </p>
            <h2 className="mt-4 text-2xl font-bold text-dark sm:text-3xl">
              Tout ce dont vous avez besoin pour investir sereinement
            </h2>
          </div>

          <div className="mt-11 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {avantages.map((avantage) => (
              <article
                key={avantage.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
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
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Investisseurs inscrits
            </p>
            <h2 className="mt-4 text-2xl font-bold text-dark sm:text-3xl">
              Les partenaires financiers présents sur OkeTech
            </h2>
          </div>

          {investisseurs.length === 0 ? (
            <div className="mt-10 rounded-xl border border-border bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-bold text-dark">Aucun investisseur inscrit pour le moment</h3>
              <p className="mx-auto mt-3 max-w-[460px] text-sm leading-6 text-muted">
                Les comptes investisseurs créés sur OkeTech apparaîtront ici automatiquement.
              </p>
              <PublicAuthLink
                visiteurLabel="Créer un compte investisseur"
                connecteLabel="Accéder à mon espace"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90"
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {investisseurs.map((investisseur) => (
                <article
                  key={investisseur.id}
                  className="relative rounded-xl border border-border bg-white p-6 text-center shadow-sm"
                >
                  {(investisseur.verifie || investisseur.premium) && (
                    <span className="absolute right-5 top-5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {investisseur.premium ? 'Premium' : 'Vérifié'}
                    </span>
                  )}

                  <div
                    className={`mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ${investisseur.couleur} text-sm font-semibold text-white`}
                  >
                    {investisseur.avatarUrl ? (
                      <Image src={investisseur.avatarUrl} alt="" width={80} height={80} unoptimized className="h-full w-full object-cover" />
                    ) : (
                      investisseur.initiales
                    )}
                  </div>
                  <h3 className="mt-6 text-base font-bold text-dark">{investisseur.nomComplet}</h3>
                  <p className="mt-2 text-sm text-muted">{investisseur.titre}</p>
                  <p className="mt-2 text-xs font-medium text-muted">{investisseur.pays}</p>
                  <p className="mt-4 min-h-12 text-sm leading-6 text-muted">
                    {investisseur.bio || 'Profil investisseur en cours de finalisation.'}
                  </p>

                  <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium">
                      <span className="text-muted">Score confiance</span>
                      <span className="text-primary">{investisseur.score}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200">
                      <div className={`h-full rounded-full bg-primary ${investisseur.progressionClasse}`} />
                    </div>
                  </div>

                  <Link
                    href={`/messagerie?destinataire=${investisseur.id}`}
                    className="mt-6 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
                  >
                    Contacter
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1520px]">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Projets disponibles
            </p>
            <h2 className="mt-4 text-2xl font-bold text-dark sm:text-3xl">
              Opportunités réelles publiées par les développeurs
            </h2>
          </div>

          {projets.length === 0 ? (
            <div className="mt-10 rounded-xl border border-border bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-bold text-dark">Aucun projet disponible pour le moment</h3>
              <p className="mx-auto mt-3 max-w-[460px] text-sm leading-6 text-muted">
                Cette section affichera uniquement les projets réels publiés par les développeurs OkeTech.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {projets.map((projet) => (
                <article key={projet.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                  <div className="relative flex h-48 items-center justify-center overflow-hidden bg-dark">
                    {projet.image ? (
                      <Image
                        src={projet.image}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                        unoptimized
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <span className="text-2xl font-extrabold text-primary">{projet.titre.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-[292px] flex-col p-5">
                    <h3 className="text-base font-bold text-dark">{projet.titre}</h3>
                    <p className="mt-2 text-sm font-semibold text-primary">{projet.promesse}</p>
                    <p className="mt-4 text-sm leading-6 text-muted">{projet.description}</p>
                    <p className="mt-5 text-xs font-semibold text-primary">{projet.financement}</p>
                    <Link
                      href={`/projets/${projet.id}`}
                      className="mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
                    >
                      Voir le dossier
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1520px] flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <p className="text-base font-semibold sm:text-lg">
            Rejoins OkeTech et commence à investir dans l&apos;avenir africain
          </p>
          <PublicAuthLink
            visiteurLabel="Créer mon compte"
            connecteLabel="Accéder à mon espace"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-12 text-sm font-semibold text-primary transition hover:bg-slate-100 sm:w-auto"
          />
        </div>
      </section>
    </main>
  )
}
