"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardIdentity from "@/components/dashboard/DashboardIdentity"
import { createClient } from "@/lib/supabase/client"

type Vue = "decouvrir" | "dossiers" | "messages" | "suivi"

interface Projet {
  id: string
  titre: string
  description: string
  secteur: string
  pays: string
  budget_cible: number
  score: number
  financement_pct: number
}

interface Acces {
  id: string
  projet_id: string
  statut: string
  montant: number
  projets?: { titre?: string; secteur?: string } | null
}

interface ProfilConnecte {
  nom: string
  prenom: string | null
  avatar_url: string | null
}

const navigation: Array<{ id: Vue; label: string }> = [
  { id: "decouvrir", label: "Découvrir" },
  { id: "dossiers", label: "Dossiers" },
  { id: "messages", label: "Messages" },
  { id: "suivi", label: "Suivi" },
]

export default function DashboardInvestisseurPage() {
  const router = useRouter()
  const [vue, setVue] = useState<Vue>("decouvrir")
  const [projets, setProjets] = useState<Projet[]>([])
  const [acces, setAcces] = useState<Acces[]>([])
  const [profil, setProfil] = useState<ProfilConnecte | null>(null)
  const [message, setMessage] = useState("")

  async function chargerDonnees() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const [profileResult, projetsResult, accesResult] = await Promise.all([
        supabase.from("profiles").select("nom, prenom, avatar_url").eq("id", user.id).single(),
        supabase
          .from("projets")
          .select("id, titre, description, secteur, pays, budget_cible, score, financement_pct")
          .eq("statut", "actif")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("acces_dossiers")
          .select("id, projet_id, statut, montant, projets(titre, secteur)")
          .order("created_at", { ascending: false }),
      ])

      if (profileResult.data) setProfil(profileResult.data as ProfilConnecte)
      if (projetsResult.data) setProjets(projetsResult.data as Projet[])
      if (accesResult.data) setAcces(accesResult.data as Acces[])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.")
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void chargerDonnees()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function seDeconnecter() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/connexion")
    router.refresh()
  }

  const stats = [
    { titre: "Dossiers débloqués", valeur: String(acces.filter((item) => item.statut === "confirme").length), detail: "Accès confirmés" },
    { titre: "Projets disponibles", valeur: String(projets.length), detail: "Catalogue actif" },
    { titre: "Montant engagé", valeur: `${acces.reduce((total, item) => total + Number(item.montant ?? 0), 0).toLocaleString("fr-FR")} FCFA`, detail: "Accès dossiers" },
  ]
  const nomUtilisateur = `${profil?.prenom ?? ""} ${profil?.nom ?? ""}`.trim() || "Investisseur"
  const initiales = nomUtilisateur
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((partie) => partie[0]?.toUpperCase())
    .join("") || "OK"

  return (
    <main className="bg-light">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[230px_1fr]">
        <aside className="bg-dark px-4 py-5 text-white lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]">
          <DashboardIdentity
            nom={nomUtilisateur}
            sousTitre="Espace investisseur"
            avatarUrl={profil?.avatar_url}
            initiales={initiales}
            onAvatarUpdated={(url) => setProfil((actuel) => actuel ? { ...actuel, avatar_url: url } : actuel)}
          />

          <Link href="/projets" className="mt-7 flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white">
            Explorer le catalogue
          </Link>

          <nav className="mt-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setVue(item.id)}
                className={`flex h-11 w-full items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                  vue === item.id ? "bg-white text-dark" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button type="button" onClick={seDeconnecter} className="mt-8 flex h-10 w-full items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white">
            Se déconnecter
          </button>
        </aside>

        <section className="px-6 py-6 sm:px-8 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Espace investisseur</p>
              <h1 className="mt-2 text-2xl font-bold text-dark">Tableau de bord investisseur</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Consultez les projets, débloquez les dossiers et suivez vos opportunités.
              </p>
            </div>
            <Link href="/projets" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white">
              Découvrir les projets
            </Link>
          </div>

          {message && <p className="mt-5 rounded-xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-semibold text-primary">{message}</p>}

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {stats.map((stat) => (
              <article key={stat.titre} className="min-h-[128px] rounded-xl border border-border bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-muted">{stat.titre}</h2>
                <p className="mt-6 text-2xl font-bold text-dark">{stat.valeur}</p>
                <p className="mt-2 text-xs font-semibold text-primary">{stat.detail}</p>
              </article>
            ))}
          </div>

          <section className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Pack investisseur</p>
                <h2 className="mt-2 text-xl font-bold text-dark">5 dossiers complets pour 100 000 FCFA</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Analysez plusieurs opportunités sans payer chaque dossier un par un.
                </p>
              </div>
              <Link href="/paiement?type=pack_investisseur" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white">
                Acheter le pack
              </Link>
            </div>
          </section>

          {vue === "decouvrir" && <Projets projets={projets} />}
          {vue === "dossiers" && <Dossiers acces={acces} />}
          {vue === "messages" && <SectionSimple titre="Messages" texte="Échangez avec les développeurs après avoir identifié les projets prioritaires." href="/messagerie" action="Ouvrir la messagerie" />}
          {vue === "suivi" && <SectionSimple titre="Suivi portefeuille" texte="Suivez les dossiers débloqués, les échanges et les opportunités en cours." href="/projets" action="Voir les projets" />}
        </section>
      </div>
    </main>
  )
}

function Projets({ projets }: { projets: Projet[] }) {
  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Projets recommandés</h2>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {projets.length === 0 ? (
          <p className="text-sm text-muted">Aucun projet Supabase pour le moment.</p>
        ) : (
          projets.map((projet) => (
            <article key={projet.id} className="rounded-xl border border-border bg-light p-5">
              <p className="text-xs font-bold uppercase text-primary">{projet.secteur}</p>
              <h3 className="mt-3 text-base font-bold text-dark">{projet.titre}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{projet.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-muted">Objectif</p>
                  <p className="mt-1 font-bold text-dark">{Number(projet.budget_cible).toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <p className="text-primary">Score</p>
                  <p className="mt-1 font-bold text-primary">{projet.score}/100</p>
                </div>
              </div>
              <Link href={`/projets/${projet.id}`} className="mt-5 flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white">
                Voir le dossier
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

function Dossiers({ acces }: { acces: Acces[] }) {
  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Dossiers consultés</h2>
      <div className="mt-4 divide-y divide-border">
        {acces.length === 0 ? (
          <p className="py-5 text-sm text-muted">Aucun dossier débloqué pour le moment.</p>
        ) : (
          acces.map((item) => (
            <Link key={item.id} href={`/projets/${item.projet_id}`} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-bold text-dark">{item.projets?.titre ?? "Projet"}</p>
                <p className="mt-1 text-xs text-muted">{item.projets?.secteur ?? "Secteur"} · {item.montant.toLocaleString("fr-FR")} FCFA</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.statut}</span>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

function SectionSimple({ titre, texte, href, action }: { titre: string; texte: string; href: string; action: string }) {
  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">{titre}</h2>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{texte}</p>
      <Link href={href} className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white">
        {action}
      </Link>
    </section>
  )
}
