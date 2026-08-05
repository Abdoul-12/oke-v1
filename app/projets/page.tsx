"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { sanitizeSearch } from "@/lib/security/input"

const secteurs = ["Fintech", "Agritech", "Healthtech", "Edutech"]
const pays = ["Gabon", "Sénégal", "Nigeria", "Maroc", "Côte d'Ivoire", "Kenya", "Tunisie", "Afrique du Sud"]
const scores = ["Excellent 90+", "Très bon 80+", "Correct 70+"]

interface ProjetCatalogue {
  id: string
  titre: string
  promesse: string
  description: string
  budget: string
  secteur: string
  pays: string
  score: number
  financement: string
  porteur: string
  statut: string
  progression: string
  image: string | null
  sponsored: boolean
}

function scoreMinimum(label: string) {
  if (label.includes("90")) return 90
  if (label.includes("80")) return 80
  return 70
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

export default function ProjetsPage() {
  const [recherche, setRecherche] = useState("")
  const [filtres, setFiltres] = useState<string[]>([])
  const [projets, setProjets] = useState<ProjetCatalogue[]>([])
  const [chargement, setChargement] = useState(true)
  const filtresActifs = filtres.length > 0 || recherche.trim().length > 0

  useEffect(() => {
    async function chargerProjets() {
      setChargement(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("projets")
          .select("id, titre, description, secteur, pays, budget_cible, financement_pct, score, image_url, statut, sponsored, profiles:developpeur_id(prenom, nom)")
          .eq("statut", "actif")
          .order("sponsored", { ascending: false })
          .order("created_at", { ascending: false })

        if (error) {
          setProjets([])
          return
        }

        if (!data?.length) {
          setProjets([])
          return
        }

        setProjets(
          data.map((projet) => {
            const profile = Array.isArray(projet.profiles) ? projet.profiles[0] : projet.profiles
            const financement = Number(projet.financement_pct ?? 0)

            return {
              id: String(projet.id),
              titre: String(projet.titre),
              promesse: String(projet.description).split(".")[0] || "Projet tech africain à fort potentiel",
              description: String(projet.description),
              budget: `${Number(projet.budget_cible ?? 0).toLocaleString("fr-FR")} FCFA`,
              secteur: String(projet.secteur),
              pays: String(projet.pays),
              score: Number(projet.score ?? 0),
              financement: `${financement}%`,
              porteur: `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim() || "Développeur OkeTech",
              statut: "Projet vérifié",
              progression: progressionClasse(financement),
              image: projet.image_url || null,
              sponsored: Boolean(projet.sponsored),
            }
          }),
        )
      } catch {
        setProjets([])
      } finally {
        setChargement(false)
      }
    }

    chargerProjets()
  }, [])

  function basculerFiltre(valeur: string) {
    setFiltres((actuels) =>
      actuels.includes(valeur) ? actuels.filter((item) => item !== valeur) : [...actuels, valeur]
    )
  }

  function reinitialiserFiltres() {
    setRecherche("")
    setFiltres([])
  }

  const projetsFiltres = useMemo(() => {
    const texte = recherche.trim().toLowerCase()

    return projets.filter((projet) => {
      const correspondRecherche =
        !texte ||
        projet.titre.toLowerCase().includes(texte) ||
        projet.description.toLowerCase().includes(texte) ||
        projet.secteur.toLowerCase().includes(texte) ||
        projet.pays.toLowerCase().includes(texte)

      const filtresSecteur = filtres.filter((filtre) => secteurs.includes(filtre))
      const filtresPays = filtres.filter((filtre) => pays.includes(filtre))
      const filtresScore = filtres.filter((filtre) => scores.includes(filtre))

      const correspondSecteur = filtresSecteur.length === 0 || filtresSecteur.includes(projet.secteur)
      const correspondPays = filtresPays.length === 0 || filtresPays.includes(projet.pays)
      const correspondScore =
        filtresScore.length === 0 || filtresScore.some((filtre) => projet.score >= scoreMinimum(filtre))

      return correspondRecherche && correspondSecteur && correspondPays && correspondScore
    })
  }, [filtres, projets, recherche])

  return (
    <main className="min-h-screen bg-light">
      <div className="mx-auto grid w-full max-w-[1760px] gap-6 px-6 py-10 sm:px-8 lg:grid-cols-[260px_1fr] lg:px-12 lg:py-[60px] 2xl:px-20">
        <aside className="rounded-xl border border-border bg-white px-5 py-6 shadow-sm lg:min-h-[760px]">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-bold text-dark">Filtres</h1>
            {filtresActifs && (
              <button
                type="button"
                onClick={reinitialiserFiltres}
                className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="mt-6 space-y-6">
            <fieldset>
              <legend className="text-sm font-bold text-dark">Secteur</legend>
              <div className="mt-3 space-y-2.5">
                {secteurs.map((secteur) => (
                  <label key={secteur} className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={filtres.includes(secteur)}
                      onChange={() => basculerFiltre(secteur)}
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    {secteur}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-bold text-dark">Pays</legend>
              <div className="mt-3 space-y-2.5">
                {pays.map((nomPays) => (
                  <label key={nomPays} className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={filtres.includes(nomPays)}
                      onChange={() => basculerFiltre(nomPays)}
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    {nomPays}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-bold text-dark">Score</legend>
              <div className="mt-3 space-y-2.5">
                {scores.map((score) => (
                  <label key={score} className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={filtres.includes(score)}
                      onChange={() => basculerFiltre(score)}
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    {score}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </aside>

        <section>
          <div className="mb-6 rounded-2xl bg-dark px-4 py-5 text-white shadow-sm">
            <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight md:text-2xl">
              Trouvez un projet qui mérite d&apos;être ouvert, analysé et financé.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Chaque carte présente l&apos;essentiel : le problème résolu, la crédibilité du projet
              et le dossier à débloquer quand l&apos;opportunité vous intéresse.
            </p>
          </div>

          <label htmlFor="recherche-projet" className="sr-only">
            Rechercher un projet
          </label>
          <div className="flex h-[52px] items-center gap-3 rounded-lg border border-border bg-white px-4 shadow-sm">
            <span aria-hidden="true" className="text-lg text-muted">⌕</span>
            <input
              id="recherche-projet"
              type="search"
              value={recherche}
              onChange={(event) => setRecherche(sanitizeSearch(event.target.value))}
              maxLength={80}
              placeholder="Rechercher un projet, une technologie ou un pays..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-dark outline-none placeholder:text-slate-400 sm:text-base"
            />
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {projetsFiltres.length} projet{projetsFiltres.length > 1 ? "s" : ""} affiché{projetsFiltres.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs font-medium text-muted">
              Données chargées depuis Supabase.
            </p>
          </div>

          {chargement ? (
            <div className="mt-5 rounded-xl border border-border bg-white p-10 text-center shadow-sm">
              <h2 className="text-lg font-bold text-dark">Chargement des projets</h2>
              <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-muted">
                OkeTech récupère les projets publiés par les développeurs.
              </p>
            </div>
          ) : projetsFiltres.length === 0 ? (
            <div className="mt-5 rounded-xl border border-border bg-white p-10 text-center shadow-sm">
              <h2 className="text-lg font-bold text-dark">
                {filtresActifs ? "Aucun projet trouvé" : "Aucun projet publié pour le moment"}
              </h2>
              <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-muted">
                {filtresActifs
                  ? "Aucun projet réel ne correspond à votre recherche ou aux filtres sélectionnés."
                  : "Dès qu'un développeur publie un projet depuis son dashboard, il apparaîtra ici automatiquement."}
              </p>
              {filtresActifs && (
                <button
                  type="button"
                  onClick={reinitialiserFiltres}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              {projetsFiltres.map((projet) => (
                <article key={projet.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <div className="relative flex h-[210px] items-center justify-center overflow-hidden bg-dark">
                  {projet.sponsored && (
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                      Mis en avant
                    </span>
                  )}
                  {projet.image ? (
                    <Image
                      src={projet.image}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      unoptimized
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-2xl font-extrabold text-white">
                      {projet.titre.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                  <div className="flex min-h-[300px] flex-col p-5">
                    <h2 className="text-base font-bold text-dark">{projet.titre}</h2>
                    <p className="mt-2 text-sm font-semibold text-primary">{projet.promesse}</p>
                    <p className="mt-4 text-sm leading-6 text-muted">{projet.description}</p>

                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-semibold text-primary">{projet.secteur}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>{projet.pays}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>Par {projet.porteur}</span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-light p-3">
                        <p className="font-medium text-muted">Objectif</p>
                        <p className="mt-1 font-bold text-dark">{projet.budget}</p>
                      </div>
                      <div className="rounded-lg bg-primary/10 p-3">
                        <p className="font-medium text-primary">Crédibilité</p>
                        <p className="mt-1 font-bold text-primary">{projet.score}/100</p>
                      </div>
                    </div>

                    <div className="mt-5 h-1 rounded-full bg-border">
                      <div className={`h-full rounded-full bg-primary ${projet.progression}`} />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-primary">
                      {projet.financement} financé · {projet.statut}
                    </p>

                    <div className="mt-auto pt-6">
                      <Link
                        href={`/projets/${projet.id}`}
                        className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                      >
                        Voir le Dossier
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
