import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

interface ProjetDetail {
  id: string
  developpeurId: string
  titre: string
  secteur: string
  pays: string
  score: number
  objectif: string
  financement: string
  progression: string
  image: string | null
  developpeur: string
  initiales: string
  resume: string
  probleme: string
  solution: string[]
}

function progressionClasse(valeur: number) {
  if (valeur >= 90) return "w-[90%]"
  if (valeur >= 80) return "w-[80%]"
  if (valeur >= 75) return "w-[75%]"
  if (valeur >= 60) return "w-[60%]"
  if (valeur >= 40) return "w-[40%]"
  if (valeur >= 20) return "w-[20%]"
  return "w-[10%]"
}

async function getProjet(id: string): Promise<ProjetDetail | null> {
  try {
    const supabase = await createClient()
    const projetAvance = await supabase
      .from("projets")
      .select("id, developpeur_id, titre, description, probleme, solution, secteur, pays, budget_cible, financement_pct, score, image_url, profiles:developpeur_id(prenom, nom)")
      .eq("id", id)
      .single()

    const { data, error } = projetAvance.error
      ? await supabase
          .from("projets")
          .select("id, developpeur_id, titre, description, secteur, pays, budget_cible, financement_pct, score, profiles:developpeur_id(prenom, nom)")
          .eq("id", id)
          .single()
      : projetAvance

    if (error || !data) {
      return null
    }

    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    const financement = Number(data.financement_pct ?? 0)
    const solutionTexte = "solution" in data && typeof data.solution === "string" ? data.solution : ""
    const imageUrl = "image_url" in data && typeof data.image_url === "string" ? data.image_url : null
    const problemeTexte = "probleme" in data && typeof data.probleme === "string" && data.probleme.trim()
      ? data.probleme
      : String(data.description)
    const solution =
      solutionTexte.trim()
        ? solutionTexte.split(",").map((item) => item.trim()).filter(Boolean)
        : ["Solution structurée", "Roadmap claire", "Impact mesurable"]

    return {
      id: String(data.id),
      developpeurId: String(data.developpeur_id),
      titre: String(data.titre),
      secteur: String(data.secteur),
      pays: String(data.pays),
      score: Number(data.score ?? 0),
      objectif: `${Number(data.budget_cible ?? 0).toLocaleString("fr-FR")} FCFA`,
      financement: `${financement}%`,
      progression: progressionClasse(financement),
      image: imageUrl,
      developpeur: `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim() || "Développeur OkeTech",
      initiales: `${profile?.prenom?.[0] ?? "O"}${profile?.nom?.[0] ?? "K"}`.toUpperCase(),
      resume: String(data.description),
      probleme: problemeTexte,
      solution,
    }
  } catch {
    return null
  }
}

interface ProjetDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjetDetailPage({ params }: ProjetDetailPageProps) {
  const { id } = await params
  const projet = await getProjet(id)

  if (!projet) {
    notFound()
  }

  let accesConfirme = false

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: acces } = await supabase
        .from("acces_dossiers")
        .select("id")
        .eq("investisseur_id", user.id)
        .eq("projet_id", projet.id)
        .eq("statut", "confirme")
        .maybeSingle()

      accesConfirme = Boolean(acces)
    }
  } catch {
    accesConfirme = false
  }

  return (
    <main className="bg-light">
      <div className="mx-auto grid w-full max-w-[1760px] gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_410px] lg:px-12 2xl:px-20">
        <section className="min-w-0">
          <nav className="text-xs text-muted" aria-label="Fil d'Ariane">
            <Link href="/projets" className="transition-colors hover:text-primary">
              Projets
            </Link>
            <span className="mx-2">/</span>
            <span>{projet.titre}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-secondary/10 px-3 py-1 font-semibold text-secondary">{projet.secteur}</span>
            <span className="text-muted">{projet.pays}</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Score {projet.score}/100</span>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-stretch">
              <div>
                <h1 className="text-[30px] font-bold leading-tight text-dark sm:text-[38px]">{projet.titre}</h1>
                <p className="mt-4 max-w-[620px] text-sm leading-7 text-muted">{projet.resume}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-xs">
                  <span className="rounded-full bg-light px-3 py-1 font-semibold text-muted">Objectif {projet.objectif}</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">{projet.financement} financé</span>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 font-semibold text-secondary">Projet en croissance</span>
                </div>
              </div>

              <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-dark">
                {projet.image ? (
                  <Image
                    src={projet.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 320px, 100vw"
                    unoptimized
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white shadow-lg">
                    <span className="text-3xl font-extrabold text-primary">{projet.titre.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <article className="mt-4 rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-dark">Le Problème</h2>
            <div className="mt-3 h-px bg-border" />
            <p className="mt-4 max-w-[680px] text-sm leading-7 text-muted">{projet.probleme}</p>
          </article>

          <article className="mt-4 rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-dark">La Solution</h2>
            <div className="mt-3 h-px bg-border" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {projet.solution.map((item) => (
                <div key={item} className="rounded-lg border border-border bg-light px-4 py-3 text-sm font-medium text-dark">
                  {item}
                </div>
              ))}
            </div>
          </article>

          {accesConfirme ? (
            <article className="mt-4 rounded-xl border border-primary/20 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Dossier débloqué</p>
                  <h2 className="mt-2 text-xl font-bold text-dark">Informations investisseur</h2>
                  <p className="mt-3 max-w-[640px] text-sm leading-7 text-muted">
                    Vous avez accès aux informations avancées du projet et au contact direct du développeur.
                  </p>
                </div>
                <Link href={`/messagerie?destinataire=${projet.developpeurId}`} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white">
                  Contacter le développeur
                </Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["Business Plan", "Modèle économique, marché ciblé et stratégie de croissance."],
                  ["Prévisions financières", "Projection sur 5 ans, besoins et hypothèses clés."],
                  ["Roadmap technique", "Architecture, étapes produit et risques principaux."],
                ].map(([titre, texte]) => (
                  <div key={titre} className="rounded-xl bg-light p-4">
                    <h3 className="text-sm font-bold text-dark">{titre}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{texte}</p>
                  </div>
                ))}
              </div>
            </article>
          ) : (
            <article className="mt-4 rounded-xl border border-border bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-light text-lg text-muted">⌁</div>
              <h2 className="mt-4 text-sm font-bold text-dark">Dossier complet verrouillé</h2>
              <p className="mx-auto mt-4 max-w-[460px] text-sm leading-7 text-muted">
                Accédez au Business Plan, aux prévisions financières et au contact direct du développeur.
              </p>
              <ul className="mx-auto mt-5 grid max-w-[430px] gap-2 text-left text-sm text-muted sm:grid-cols-2">
                {[
                  "Business Plan détaillé",
                  "Prévisions financières 5 ans",
                  "Architecture technique & Roadmap",
                  "Analyse marché et stratégie",
                  "Analyse de risques",
                  "Contact direct du développeur",
                ].map((item) => (
                  <li key={item} className="flex gap-2 rounded-lg bg-light px-3 py-2">
                    <span className="text-primary">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/paiement?projet=${projet.id}`}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Accéder au dossier · 25 000 FCFA
              </Link>
            </article>
          )}
        </section>

        <aside className="space-y-4 lg:pt-[96px]">
          <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-dark">Le Développeur</h2>
            <div className="mt-3 h-px bg-border" />
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                {projet.initiales}
              </div>
              <div>
                <p className="text-sm font-bold text-dark">{projet.developpeur}</p>
                <p className="mt-1 text-xs font-semibold text-primary">Développeur vérifié</p>
                <p className="mt-1 text-xs text-muted">Contact complet après accès dossier</p>
              </div>
            </div>
            <p className="mt-5 text-xs text-muted">Score crédibilité</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-border">
                <div className={`h-full rounded-full bg-primary ${projet.progression}`} />
              </div>
              <span className="text-xs font-semibold text-primary">{projet.score}/100</span>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-5 text-center shadow-sm">
            <h2 className="text-left text-sm font-bold text-dark">Financement</h2>
            <div className="mt-3 h-px bg-border" />
            <p className="mt-5 text-sm font-bold text-primary">{projet.financement}</p>
            <p className="mt-5 text-xs text-muted">de l&apos;objectif atteint</p>
            <div className="mt-5 h-3 rounded-full bg-border">
              <div className={`h-full rounded-full bg-primary ${projet.progression}`} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>0 FCFA</span>
              <span>{projet.objectif}</span>
            </div>
          </section>

          <section className="rounded-2xl bg-dark p-5 text-center text-white shadow-sm">
            <p className="text-sm font-semibold">25 000 FCFA</p>
            <p className="mt-5 text-xs text-slate-400">Accès unique et immédiat</p>
            <Link
              href={`/paiement?projet=${projet.id}`}
              className="mt-5 flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Accéder au dossier · 25 000 FCFA
            </Link>
            <p className="mt-4 text-xs text-slate-500">Paiement sécurisé</p>
          </section>
        </aside>
      </div>
    </main>
  )
}
