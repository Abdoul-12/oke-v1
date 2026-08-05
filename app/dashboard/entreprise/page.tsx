"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardIdentity from "@/components/dashboard/DashboardIdentity"
import { createClient } from "@/lib/supabase/client"

type Vue = "talents" | "offres" | "messages" | "suivi"

interface Offre {
  id: string
  titre: string
  description: string
  type_contrat: string | null
  technologies: string[] | null
  localisation: string | null
  created_at: string
}

interface Talent {
  id: string
  nom: string
  prenom: string | null
  pays: string | null
  bio: string | null
  score: number
  verifie: boolean
  skills: string[] | null
}

interface ProfilConnecte {
  nom: string
  prenom: string | null
  avatar_url: string | null
}

const navigation: Array<{ id: Vue; label: string }> = [
  { id: "talents", label: "Talents" },
  { id: "offres", label: "Offres" },
  { id: "messages", label: "Messages" },
  { id: "suivi", label: "Suivi" },
]

export default function DashboardEntreprisePage() {
  const router = useRouter()
  const [vue, setVue] = useState<Vue>("talents")
  const [formulaire, setFormulaire] = useState(false)
  const [offres, setOffres] = useState<Offre[]>([])
  const [talents, setTalents] = useState<Talent[]>([])
  const [profil, setProfil] = useState<ProfilConnecte | null>(null)
  const [messagesNonLus, setMessagesNonLus] = useState(0)
  const [message, setMessage] = useState("")
  const [chargement, setChargement] = useState(false)

  async function chargerOffres() {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const session = data.session
      const token = session?.access_token
      if (!token) return

      const talentsAdvanced = await supabase
        .from("profiles")
        .select("id, nom, prenom, pays, bio, score, verifie, skills")
        .eq("role", "developpeur")
        .order("score", { ascending: false })
        .limit(6)
      const talentsFallback = talentsAdvanced.error
        ? await supabase
            .from("profiles")
            .select("id, nom, prenom, pays, bio, score, verifie")
            .eq("role", "developpeur")
            .order("score", { ascending: false })
            .limit(6)
        : talentsAdvanced

      const [
        response,
        profileResult,
        messagesResult,
      ] = await Promise.all([
        fetch("/api/offers", { headers: { Authorization: `Bearer ${token}` } }),
        supabase.from("profiles").select("nom, prenom, avatar_url").eq("id", session.user.id).single(),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("destinataire", session.user.id).eq("lu", false),
      ])

      const result = (await response.json().catch(() => null)) as { offres?: Offre[] } | null
      if (response.ok) {
        setOffres(result?.offres ?? [])
      }
      if (profileResult.data) setProfil(profileResult.data as ProfilConnecte)
      if (talentsFallback.data) {
        setTalents(
          talentsFallback.data.map((talent) => ({
            ...(talent as Talent),
            skills: "skills" in talent && Array.isArray(talent.skills) ? talent.skills : [],
          })),
        )
      }
      setMessagesNonLus(messagesResult.count ?? 0)
    } catch {
      setOffres([])
      setTalents([])
      setMessagesNonLus(0)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void chargerOffres()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function publierOffre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setChargement(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      titre: formData.get("titre"),
      description: formData.get("description"),
      type_contrat: formData.get("type_contrat"),
      localisation: formData.get("localisation"),
      technologies: formData.get("technologies"),
      salaire_min: formData.get("salaire_min"),
      salaire_max: formData.get("salaire_max"),
    }

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        setMessage("Session expirée. Reconnectez-vous.")
        return
      }

      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        setMessage(result?.message ?? "Publication impossible.")
        return
      }

      setMessage("Offre publiée avec succès.")
      setFormulaire(false)
      setVue("offres")
      event.currentTarget.reset()
      await chargerOffres()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publication impossible.")
    } finally {
      setChargement(false)
    }
  }

  async function deconnecter() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/connexion")
  }

  const statistiques = [
    { titre: "Offres actives", valeur: String(offres.length), detail: "Postes publiés" },
    { titre: "Talents disponibles", valeur: String(talents.length), detail: "Profils réels" },
    { titre: "Messages non lus", valeur: String(messagesNonLus), detail: "À traiter" },
    { titre: "Sponsorisation", valeur: "50k+", detail: "FCFA par offre" },
  ]
  const nomUtilisateur = `${profil?.prenom ?? ""} ${profil?.nom ?? ""}`.trim() || "Entreprise"
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
            sousTitre="Espace entreprise"
            avatarUrl={profil?.avatar_url}
            initiales={initiales}
            onAvatarUpdated={(url) => setProfil((actuel) => actuel ? { ...actuel, avatar_url: url } : actuel)}
          />

          <button
            type="button"
            onClick={() => {
              setFormulaire(true)
              setVue("offres")
            }}
            className="mt-7 flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
          >
            + Publier une offre
          </button>

          <nav className="mt-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setVue(item.id)
                  setFormulaire(false)
                }}
                className={`flex h-11 w-full items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                  vue === item.id ? "bg-white text-dark" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <Link href="/messagerie" className="mt-8 flex h-10 items-center justify-center rounded-lg border border-white/15 text-sm font-semibold text-slate-200">
            Ouvrir messagerie
          </Link>

          <button
            type="button"
            onClick={deconnecter}
            className="mt-3 flex h-10 w-full items-center justify-center rounded-lg border border-white/15 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
          >
            Se déconnecter
          </button>
        </aside>

        <section className="px-6 py-6 sm:px-8 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Espace entreprise</p>
              <h1 className="mt-2 text-2xl font-bold text-dark">Tableau de bord entreprise</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Publiez vos offres, trouvez des talents africains vérifiés et suivez vos recrutements.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/developpeurs" className="h-10 rounded-lg border border-border bg-white px-6 text-center text-sm font-semibold leading-10 text-muted hover:border-primary hover:text-primary">
                Explorer les talents
              </Link>
              <button type="button" onClick={() => setFormulaire(true)} className="h-10 rounded-lg bg-secondary px-6 text-sm font-semibold text-white hover:bg-secondary/90">
                + Publier une offre
              </button>
            </div>
          </div>

          {message && <p className="mt-5 rounded-xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-semibold text-primary">{message}</p>}

          {formulaire && (
            <form onSubmit={publierOffre} className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="border-b border-border pb-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Nouvelle offre</p>
                <h2 className="mt-2 text-xl font-bold text-dark">Publier une opportunité claire et attractive</h2>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Champ name="titre" label="Titre" placeholder="Développeur React Senior" />
                <Champ name="type_contrat" label="Type de contrat" placeholder="CDI, Freelance, Stage..." />
                <Champ name="localisation" label="Localisation" placeholder="Libreville, Remote..." />
                <Champ name="technologies" label="Technologies" placeholder="React, Node.js, PostgreSQL" />
                <Champ name="salaire_min" label="Salaire minimum" placeholder="500000" />
                <Champ name="salaire_max" label="Salaire maximum" placeholder="1200000" />
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-dark">Description</span>
                <textarea name="description" placeholder="Décrivez la mission, les responsabilités et le profil recherché." className="mt-2 min-h-32 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
              </label>
              <div className="mt-5 flex gap-3">
                <button type="submit" disabled={chargement} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white disabled:bg-primary/70">
                  {chargement ? "Publication..." : "Publier l'offre"}
                </button>
                <button type="button" onClick={() => setFormulaire(false)} className="h-11 rounded-lg border border-border px-6 text-sm font-semibold text-muted">
                  Annuler
                </button>
              </div>
            </form>
          )}

          {!formulaire && (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statistiques.map((stat) => (
                  <article key={stat.titre} className="min-h-[128px] rounded-xl border border-border bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-muted">{stat.titre}</h2>
                    <p className="mt-6 text-3xl font-bold text-dark">{stat.valeur}</p>
                    <p className="mt-2 text-xs font-semibold text-primary">{stat.detail}</p>
                  </article>
                ))}
              </div>

              {vue === "talents" && <Talents talents={talents} />}
              {vue === "offres" && <Offres offres={offres} onPublier={() => setFormulaire(true)} />}
              {vue === "messages" && <SectionSimple titre="Messages" texte="Ouvrez la messagerie pour contacter les talents et suivre vos discussions." href="/messagerie" action="Ouvrir la messagerie" />}
              {vue === "suivi" && <SectionSimple titre="Suivi recrutement" texte="La V1 affiche un suivi simplifié. Les candidatures complètes seront enrichies après les premiers tests utilisateurs." href="/developpeurs" action="Explorer les talents" />}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function Champ({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-dark">{label}</span>
      <input name={name} placeholder={placeholder} className="mt-2 h-11 w-full rounded-lg border border-border px-4 text-sm outline-none focus:border-primary" />
    </label>
  )
}

function nomTalent(talent: Talent) {
  return `${talent.prenom ?? ""} ${talent.nom}`.trim() || "Développeur OkeTech"
}

function Talents({ talents }: { talents: Talent[] }) {
  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Talents recommandés</h2>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {talents.length === 0 ? (
          <p className="rounded-xl bg-light p-5 text-sm leading-6 text-muted xl:col-span-3">
            Aucun développeur inscrit pour le moment. Les talents réels apparaîtront ici dès leur inscription.
          </p>
        ) : (
          talents.map((talent) => (
            <article key={talent.id} className="rounded-xl border border-border bg-light p-5">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                {nomTalent(talent).slice(0, 2).toUpperCase()}
              </span>
              <h3 className="mt-4 text-sm font-bold text-dark">{nomTalent(talent)}</h3>
              <p className="mt-2 text-sm text-muted">{talent.pays ?? "Pays à préciser"}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{talent.bio || "Profil en cours de finalisation."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(talent.skills ?? []).slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs font-semibold text-primary">Score {Number(talent.score ?? 0)}%</p>
              <Link href={`/messagerie?destinataire=${talent.id}`} className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white">
                Contacter
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

function Offres({ offres, onPublier }: { offres: Offre[]; onPublier: () => void }) {
  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <h2 className="text-sm font-bold text-dark">Mes offres actives</h2>
        <button type="button" onClick={onPublier} className="text-xs font-semibold text-primary">+ Publier</button>
      </div>
      <div className="mt-4 divide-y divide-border">
        {offres.length === 0 ? (
          <p className="py-5 text-sm text-muted">Aucune offre publiée pour le moment.</p>
        ) : (
          offres.map((offre) => (
            <article key={offre.id} className="py-4">
              <h3 className="text-sm font-bold text-dark">{offre.titre}</h3>
              <p className="mt-2 text-sm text-muted">{offre.description}</p>
              <p className="mt-3 text-xs font-semibold text-primary">{offre.type_contrat ?? "Contrat à préciser"} · {offre.localisation ?? "Localisation à préciser"}</p>
              <Link
                href={`/paiement?type=sponsor_offre&offre=${offre.id}`}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-primary px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                Sponsoriser · 50 000 FCFA
              </Link>
            </article>
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
