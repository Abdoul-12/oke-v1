import Link from "next/link"
import Image from "next/image"
import PublicAuthLink from "@/components/ui/PublicAuthLink"
import { getProjetsPublics } from "@/lib/projects/public"

const problemes = [
  {
    icone: "👤",
    titre: "Le développeur invisible",
    texte: "Des milliers de talents africains compétents mais sans visibilité ni opportunités adaptées à leurs compétences.",
    couleur: "bg-primary/10",
  },
  {
    icone: "💡",
    titre: "Le projet sans financement",
    texte: "De bonnes idées, des projets innovants, mais un accès difficile aux financements et aux bons partenaires.",
    couleur: "bg-yellow-50",
  },
  {
    icone: "🔍",
    titre: "L'investisseur sans visibilité",
    texte: "Des investisseurs à la recherche de projets fiables mais sans plateforme centralisée pour les découvrir.",
    couleur: "bg-lime-50",
  },
]

const etapes = [
  {
    numero: "1",
    icone: "👤",
    titre: "Crée ton profil",
    texte: "Inscris-toi en tant que développeur, investisseur ou entreprise et complète ton profil en quelques minutes.",
  },
  {
    numero: "2",
    icone: "📋",
    titre: "Présente ton projet",
    texte: "Publie tes projets, compétences ou besoins et mets en avant tes objectifs et ton potentiel.",
  },
  {
    numero: "3",
    icone: "🤝",
    titre: "Trouve ton partenaire",
    texte: "Connecte-toi avec les bonnes personnes, collabore et bâtis des projets innovants et durables.",
  },
]

const profils = [
  {
    icone: "</>",
    titre: "Développeur",
    texte: "Mets en avant tes compétences, trouve des projets adaptés à tes skills et collabore avec des équipes ambitieuses.",
    points: [
      "Trouve des projets adaptés à tes skills",
      "Collabore avec des équipes solides",
      "Développe ton réseau professionnel",
    ],
    bouton: "Je suis développeur",
    href: "/inscription",
    couleur: "bg-secondary",
  },
  {
    icone: "📈",
    titre: "Investisseur",
    texte: "Découvrez des projets innovants ou besoins et investissez dans les talents de demain.",
    points: [
      "Accès à des projets qualifiés",
      "Analyse et suivi des opportunités",
      "Investissements sécurisés",
    ],
    bouton: "Je suis investisseur",
    href: "/inscription",
    couleur: "bg-primary",
  },
  {
    icone: "🏢",
    titre: "Entreprise",
    texte: "Trouvez les meilleurs talents et développez vos projets avec des partenaires fiables.",
    points: [
      "Accès à un vivier de talents",
      "Collaboration simplifiée",
      "Projets livrés plus rapidement",
    ],
    bouton: "Je suis une entreprise",
    href: "/inscription",
    couleur: "bg-violet-600",
  },
]

const chiffres = [
  { valeur: "1000+", label: "Développeurs", texte: "talents actifs" },
  { valeur: "150+", label: "Investisseurs", texte: "engagés pour l'Afrique" },
  { valeur: "500+", label: "Projets", texte: "publiés et en croissance" },
  { valeur: "10+", label: "Pays", texte: "connectés à l'écosystème" },
]

export default async function Home() {
  const projets = await getProjetsPublics(3)

  return (
    <main className="bg-white">
      <section className="bg-dark text-white">
        <div className="mx-auto grid w-full max-w-[1760px] items-center gap-10 px-6 py-10 sm:px-8 sm:py-12 md:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 2xl:px-20 lg:py-14">
          <div>
            <h1 className="mt-3 max-w-[620px] text-3xl font-extrabold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
              Des talents africains visibles. Des projets enfin finançables.
            </h1>

            <p className="mt-6 max-w-[500px] text-[15px] leading-7 text-slate-400 md:text-base">
              OkeTech aide les développeurs à présenter leurs projets, les investisseurs à repérer les meilleures opportunités et les entreprises à recruter plus vite.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/projets"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-[14px] font-bold text-white transition-colors hover:bg-[#0c7468]"
              >
                Découvrir les projets →
              </Link>
              <PublicAuthLink
                visiteurLabel="Rejoindre OkeTech"
                connecteLabel="Accéder à mon espace"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/80 px-8 text-[14px] font-bold text-white transition-colors hover:border-primary hover:text-primary"
              />
            </div>

            <p className="mt-5 text-[13px] font-semibold text-slate-500">+2k membres actifs</p>
          </div>

          <div className="rounded-3xl border border-secondary/20 bg-secondary/10 p-5 shadow-2xl shadow-black/20">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#0B1324] p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg">👥</span>
                  <div>
                    <p className="text-[12px] text-slate-500">Développeurs</p>
                    <p className="text-[24px] font-extrabold text-white">1000+</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-[#0B1324] p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg">📈</span>
                  <div>
                    <p className="text-[12px] text-slate-500">Investisseurs</p>
                    <p className="text-[24px] font-extrabold text-white">150+</p>
                  </div>
                </div>
              </div>
              <div className="flex min-h-[124px] items-center justify-center rounded-xl bg-[#0B1324] sm:col-span-2">
                <p className="text-[18px] font-bold text-white">🌍 Afrique Tech</p>
              </div>
              <div className="rounded-xl bg-[#0B1324] p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg">📁</span>
                  <div>
                    <p className="text-[12px] text-slate-500">Projets</p>
                    <p className="text-[24px] font-extrabold text-white">500+</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-[#0B1324] p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg">🌍</span>
                  <div>
                    <p className="text-[12px] text-slate-500">Pays</p>
                    <p className="text-[24px] font-extrabold text-white">10+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1760px] px-6 sm:px-8 md:px-12 lg:px-12 2xl:px-20">
          <div className="text-center">
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight text-dark md:text-[29px]">Pourquoi OkeTech existe</h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {problemes.map((probleme) => (
              <article key={probleme.titre} className="rounded-xl border border-border bg-white p-7 shadow-sm">
                <span className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${probleme.couleur}`}>
                  {probleme.icone}
                </span>
                <h3 className="mt-6 text-[15px] font-extrabold leading-6 text-dark">{probleme.titre}</h3>
                <p className="mt-4 text-[13px] leading-6 text-slate-500">{probleme.texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1760px] px-6 sm:px-8 md:px-12 lg:px-12 2xl:px-20">
          <div className="text-center">
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight text-dark md:text-[29px]">Comment ça marche</h2>
          </div>

          <div className="mt-12 grid gap-12 text-center md:grid-cols-3">
            {etapes.map((etape) => (
              <article key={etape.numero} className="flex flex-col items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white">
                  {etape.numero}
                </span>
                <span className="mt-6 text-4xl">{etape.icone}</span>
                <h3 className="mt-4 text-[15px] font-extrabold leading-6 text-dark">{etape.titre}</h3>
                <p className="mt-4 max-w-[310px] text-[13px] leading-6 text-slate-500">{etape.texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-9">
        <div className="mx-auto w-full max-w-[1760px] px-6 sm:px-8 md:px-12 lg:px-12 2xl:px-20">
          <div className="text-center">
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight text-dark md:text-[29px]">Une plateforme pour tous</h2>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {profils.map((profil) => (
              <article key={profil.titre} className="rounded-xl border border-border bg-white p-7 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-lg text-base font-extrabold text-white ${profil.couleur}`}>
                    {profil.icone}
                  </span>
                  <h3 className="text-[18px] font-extrabold leading-6 text-dark">{profil.titre}</h3>
                </div>

                <p className="mt-6 text-[13px] leading-6 text-slate-500">{profil.texte}</p>

                <ul className="mt-6 space-y-3">
                  {profil.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[13px] font-semibold leading-5 text-slate-600">
                      <span className="text-primary">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <PublicAuthLink
                  visiteurHref={profil.href}
                  visiteurLabel={profil.bouton}
                  connecteLabel="Accéder à mon espace"
                  className={`mt-10 inline-flex h-12 w-full items-center justify-center rounded-lg text-[13px] font-bold text-white transition-opacity hover:opacity-90 ${profil.couleur}`}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1760px] px-6 sm:px-8 md:px-12 lg:px-12 2xl:px-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-dark md:text-[29px]">Découvrez les projets prometteurs</h2>
            </div>
            <Link href="/projets" className="text-[13px] font-bold text-primary">
              Voir tous les projets →
            </Link>
          </div>

          {projets.length === 0 ? (
            <div className="mt-8 rounded-xl border border-border bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-extrabold text-dark">Les projets publiés apparaîtront ici.</h3>
              <p className="mx-auto mt-3 max-w-[460px] text-sm leading-6 text-slate-500">
                Cette vitrine affiche uniquement les projets réels soumis depuis les dashboards développeurs.
              </p>
              <PublicAuthLink
                visiteurLabel="Publier un projet"
                connecteLabel="Accéder à mon espace"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary/90"
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {projets.map((projet) => (
              <article key={projet.titre} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-dark">
                  <span className="absolute left-5 top-5 z-10 rounded-full bg-secondary px-4 py-2 text-[11px] font-bold text-white">
                    {projet.secteur}
                  </span>
                  {projet.image ? (
                    <Image
                      src={projet.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      unoptimized
                      className="object-cover object-top"
                    />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-2xl font-extrabold text-white">
                      {projet.titre.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-[16px] font-extrabold leading-6 text-dark">{projet.titre}</h3>
                  <p className="mt-3 min-h-12 text-[13px] leading-6 text-slate-500">{projet.description}</p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full bg-primary ${projet.progressionClasse}`} />
                  </div>

                  <p className="mt-3 text-[12px] text-slate-400">{projet.financement}</p>
                  <p className="mt-4 text-[12px] text-slate-400">Budget recherché</p>

                  <div className="mt-1 flex items-center justify-between gap-4">
                    <p className="text-[15px] font-extrabold text-primary">{projet.budget}</p>
                    <Link
                      href={`/projets/${projet.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 px-4 text-[12px] font-bold text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-dark py-14 text-white md:py-16">
        <div className="mx-auto grid w-full max-w-[1760px] gap-10 px-6 text-center sm:grid-cols-2 sm:px-8 md:px-12 lg:grid-cols-4 lg:px-12 2xl:px-20">
          {chiffres.map((chiffre) => (
            <div key={chiffre.label}>
              <p className="text-[34px] font-extrabold leading-none text-primary md:text-[40px]">{chiffre.valeur}</p>
              <p className="mt-3 text-[15px] font-extrabold text-white">{chiffre.label}</p>
              <p className="mt-2 text-[13px] text-slate-500">{chiffre.texte}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary py-12 text-white">
        <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-8 px-6 sm:px-8 md:px-12 lg:flex-row lg:items-center lg:justify-between lg:px-12 2xl:px-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
              🚀
            </span>
            <div>
              <h2 className="text-[28px] font-extrabold leading-tight text-white md:text-[29px]">
                Ton talent mérite d&apos;être vu et financé
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-white/75">
                Rejoins la communauté OkeTech aujourd&apos;hui et construisons l&apos;avenir ensemble.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:shrink-0">
            <PublicAuthLink
              visiteurLabel="Créer mon compte"
              connecteLabel="Accéder à mon espace"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-[14px] font-extrabold text-primary transition-colors hover:bg-slate-100"
            />
            <Link
              href="/projets"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white px-8 text-[14px] font-extrabold text-white transition-colors hover:bg-white hover:text-primary"
            >
              Découvrir les projets
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
