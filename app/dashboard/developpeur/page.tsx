"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import DashboardIdentity from "@/components/dashboard/DashboardIdentity"
import DeveloperTypeSelect, { typesDeveloppeur } from "@/components/ui/DeveloperTypeSelect"
import SkillsSelector, { competencesDisponibles } from "@/components/ui/SkillsSelector"
import { createClient } from "@/lib/supabase/client"

type VueDashboard = "projets" | "opportunites" | "messagerie" | "verification" | "rapport"
type FormulaireActif = "projet" | "profil" | null

interface ProjetDeveloppeur {
  id: string
  titre: string
  statut: string
  financement_pct: number
  score: number
  created_at: string
}

interface ProfilDeveloppeur {
  nom: string
  prenom: string | null
  email: string
  telephone: string | null
  pays: string | null
  score: number
  verifie: boolean
  bio: string | null
  avatar_url: string | null
  developer_type: string | null
  skills: string[] | null
}

const navigation: Array<{ id: VueDashboard; label: string; description: string }> = [
  { id: "projets", label: "Mes projets", description: "Suivi des projets soumis" },
  { id: "opportunites", label: "Opportunités", description: "Demandes et intérêts reçus" },
  { id: "messagerie", label: "Messagerie", description: "Échanges avec investisseurs" },
  { id: "verification", label: "Vérification", description: "Score et confiance profil" },
]

function progressionClasse(valeur: number) {
  if (valeur >= 90) return "w-[90%]"
  if (valeur >= 80) return "w-[80%]"
  if (valeur >= 60) return "w-[60%]"
  if (valeur >= 40) return "w-[40%]"
  if (valeur >= 20) return "w-[20%]"
  return "w-[10%]"
}

function statutLisible(statut: string) {
  if (statut === "actif") return "Actif"
  if (statut === "brouillon") return "Brouillon"
  if (statut === "financé") return "Financé"
  return "Archivé"
}

function initialesProfil(nom: string) {
  return nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((partie) => partie[0]?.toUpperCase())
    .join("") || "OK"
}

const competencesParDefaut = ["React", "Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"]
const bioMaxLength = 500

function profilDepuisUtilisateur(user: User): ProfilDeveloppeur {
  const metadata = user.user_metadata ?? {}
  const prenom = typeof metadata.prenom === "string" ? metadata.prenom : null
  const nom = typeof metadata.nom === "string" && metadata.nom.trim() ? metadata.nom : "Développeur"
  const pays = typeof metadata.pays === "string" ? metadata.pays : "Gabon"
  const telephone = typeof metadata.telephone === "string" ? metadata.telephone : null
  const developerType = typeof metadata.developer_type === "string" && typesDeveloppeur.includes(metadata.developer_type as (typeof typesDeveloppeur)[number])
    ? metadata.developer_type
    : null
  const skills = Array.isArray(metadata.skills)
    ? metadata.skills.filter((skill): skill is string => typeof skill === "string" && competencesDisponibles.includes(skill))
    : []

  return {
    nom,
    prenom,
    email: user.email ?? "",
    telephone,
    pays,
    score: 0,
    verifie: false,
    bio: null,
    avatar_url: null,
    developer_type: developerType,
    skills,
  }
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  defaultValue,
  readOnly = false,
  helper,
  required = false,
}: {
  label: string
  name: string
  placeholder: string
  type?: string
  defaultValue?: string
  readOnly?: boolean
  helper?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-dark">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        readOnly={readOnly}
        required={required}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
      {helper && <span className="mt-1 block text-xs leading-5 text-muted">{helper}</span>}
    </label>
  )
}

function FileField({ label, name, accept }: { label: string; name: string; accept: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-dark">{label}</span>
      <input
        name={name}
        type="file"
        accept={accept}
        className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
      />
    </label>
  )
}

export default function DashboardDeveloppeurPage() {
  const router = useRouter()
  const [vue, setVue] = useState<VueDashboard>("projets")
  const [formulaireActif, setFormulaireActif] = useState<FormulaireActif>(null)
  const [message, setMessage] = useState("")
  const [chargement, setChargement] = useState(false)
  const [profil, setProfil] = useState<ProfilDeveloppeur | null>(null)
  const [utilisateur, setUtilisateur] = useState<User | null>(null)
  const [projets, setProjets] = useState<ProjetDeveloppeur[]>([])
  const [messagesRecus, setMessagesRecus] = useState(0)

  const titreVue = useMemo(() => {
    if (vue === "rapport") return "Rapport de performance"
    return navigation.find((item) => item.id === vue)?.label ?? "Mes projets"
  }, [vue])

  async function chargerDashboard() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return
      setUtilisateur(user)

      const profileAdvanced = await supabase
        .from("profiles")
        .select("nom, prenom, email, telephone, pays, score, verifie, bio, avatar_url, developer_type, skills")
        .eq("id", user.id)
        .single()
      const profileFallback = profileAdvanced.error
        ? await supabase
            .from("profiles")
            .select("nom, prenom, email, telephone, pays, score, verifie, bio, avatar_url")
            .eq("id", user.id)
            .single()
        : profileAdvanced

      const [projetsResult, messagesResult] = await Promise.all([
        supabase
          .from("projets")
          .select("id, titre, statut, financement_pct, score, created_at")
          .eq("developpeur_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("destinataire", user.id).eq("lu", false),
      ])

      if (profileFallback.data) {
        const profileData = profileFallback.data as ProfilDeveloppeur
        setProfil({
          ...profileData,
          developer_type: "developer_type" in profileData && typeof profileData.developer_type === "string" ? profileData.developer_type : null,
          skills: "skills" in profileData && Array.isArray(profileData.skills) ? profileData.skills : null,
        })
      } else {
        setProfil(profilDepuisUtilisateur(user))
      }
      if (projetsResult.data) setProjets(projetsResult.data as ProjetDeveloppeur[])
      setMessagesRecus(messagesResult.count ?? 0)
    } catch {
      setProfil((actuel) => actuel)
      setProjets([])
      setMessagesRecus(0)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void chargerDashboard()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function seDeconnecter() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/connexion")
    router.refresh()
  }

  async function modifierProfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setChargement(true)

    const formData = new FormData(event.currentTarget)
    const skills = formData
      .getAll("skills")
      .map((skill) => String(skill).trim())
      .filter((skill, index, liste) => competencesDisponibles.includes(skill) && liste.indexOf(skill) === index)
      .slice(0, 16)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage("Session expirée. Reconnectez-vous pour modifier votre profil.")
        return
      }

      const payload = {
        prenom: String(formData.get("prenom") ?? "").trim(),
        nom: String(formData.get("nom") ?? "").trim(),
        telephone: String(formData.get("telephone") ?? "").trim(),
        pays: String(formData.get("pays") ?? "").trim(),
        developer_type: String(formData.get("developer_type") ?? "").trim(),
        bio: String(formData.get("bio") ?? "").trim().slice(0, bioMaxLength),
        skills,
      }

      if (payload.developer_type && !typesDeveloppeur.includes(payload.developer_type as (typeof typesDeveloppeur)[number])) {
        setMessage("Sélectionnez un type de développeur valide.")
        return
      }

      const updated = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id)
      const updateErrorMessage = updated.error?.message.toLowerCase() ?? ""
      const error = updateErrorMessage.includes("skills") || updateErrorMessage.includes("developer_type")
        ? (await supabase
            .from("profiles")
            .update({
              prenom: payload.prenom,
              nom: payload.nom,
              telephone: payload.telephone,
              pays: payload.pays,
              bio: payload.bio,
            })
            .eq("id", user.id)).error
        : updated.error

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage("Profil mis à jour avec succès.")
      setFormulaireActif(null)
      await chargerDashboard()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mise à jour impossible pour le moment.")
    } finally {
      setChargement(false)
    }
  }

  async function publierProjet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setChargement(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const titre = String(formData.get("titre") ?? "").trim()
    const secteur = String(formData.get("secteur") ?? "").trim()
    const pays = String(formData.get("pays") ?? "").trim()
    const budget = String(formData.get("budget") ?? "").replace(/\D/g, "")
    const description = String(formData.get("description") ?? "").trim()

    if (titre.length < 3 || secteur.length < 3 || pays.length < 2 || Number(budget) <= 0 || description.length < 20) {
      setChargement(false)
      setMessage("Complétez le titre, le secteur, le pays, le budget et une description d'au moins 20 caractères.")
      return
    }

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        setMessage("Session expirée. Reconnectez-vous pour publier un projet.")
        return
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { message?: string } | null
        setMessage(result?.message ?? "Publication impossible pour le moment.")
        return
      }

      setMessage("Projet publié avec succès. Il est maintenant disponible dans le catalogue.")
      setFormulaireActif(null)
      setVue("projets")
      form.reset()
      await chargerDashboard()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publication impossible pour le moment.")
    } finally {
      setChargement(false)
    }
  }

  const nomUtilisateur = `${profil?.prenom ?? ""} ${profil?.nom ?? ""}`.trim() || "Développeur"
  const profilEdition = profil ?? (utilisateur ? profilDepuisUtilisateur(utilisateur) : null)
  const titreDeveloppeur = profilEdition?.developer_type ? `Développeur ${profilEdition.developer_type}` : "Espace développeur"
  const scoreProfil = Number(profil?.score ?? 0)
  const competencesProfil = profilEdition?.skills?.length ? profilEdition.skills : competencesParDefaut
  const projetsActifs = projets.filter((projet) => projet.statut === "actif").length
  const statistiques = [
    { titre: "Score crédibilité", valeur: `${scoreProfil}%`, detail: profil?.verifie ? "Identité vérifiée" : "À renforcer" },
    { titre: "Projets publiés", valeur: String(projets.length), detail: `${projetsActifs} actif${projetsActifs > 1 ? "s" : ""}` },
    { titre: "Messages non lus", valeur: String(messagesRecus), detail: "Messagerie" },
    { titre: "Profil", valeur: profil?.bio ? "Complet" : "À compléter", detail: profil?.bio ? "Stable" : "Priorité" },
  ]

  return (
    <main className="bg-light">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[240px_1fr]">
        <aside className="bg-dark px-4 py-5 text-white lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:overflow-y-auto">
          <DashboardIdentity
            nom={nomUtilisateur}
            sousTitre={titreDeveloppeur}
            avatarUrl={profil?.avatar_url}
            initiales={initialesProfil(nomUtilisateur)}
            onAvatarUpdated={(url) => setProfil((actuel) => actuel ? { ...actuel, avatar_url: url } : actuel)}
          />

          <button
            type="button"
            onClick={() => {
              setFormulaireActif("projet")
              setVue("projets")
              setMessage("")
            }}
            className="mt-7 flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            + Nouveau projet
          </button>

          <nav className="mt-6 space-y-2" aria-label="Navigation développeur">
            {navigation.map((item) => {
              const actif = vue === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setVue(item.id)
                    setFormulaireActif(null)
                    setMessage("")
                  }}
                  className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
                    actif ? "bg-white text-dark" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={`mt-1 block text-xs ${actif ? "text-muted" : "text-slate-500"}`}>{item.description}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => {
                setFormulaireActif("profil")
                setVue("verification")
                setMessage("")
              }}
              className="flex h-10 w-full items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-semibold text-slate-200 transition-colors hover:border-primary hover:text-white"
            >
              Modifier mon profil
            </button>
            <button
              type="button"
              onClick={seDeconnecter}
              className="mt-3 flex h-10 w-full items-center justify-center rounded-lg bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              Se déconnecter
            </button>
          </div>
        </aside>

        <section className="px-6 py-6 sm:px-8 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold text-dark">Bonjour, {nomUtilisateur}</p>
              <h1 className="mt-2 text-2xl font-bold text-dark">{titreVue}</h1>
              <p className="mt-3 text-sm text-muted">Voici ce qui se passe sur votre profil aujourd&apos;hui.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setVue("rapport")
                  setFormulaireActif(null)
                }}
                className="h-10 rounded-lg border border-border bg-white px-5 text-sm font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
              >
                Générer rapport
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormulaireActif("projet")
                  setVue("projets")
                  setMessage("")
                }}
                className="h-10 rounded-lg bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
              >
                + Nouveau projet
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-semibold text-primary">
              {message}
            </div>
          )}

          {formulaireActif === "profil" && (
            profilEdition ? (
              <FormulaireProfilDashboard
                profil={profilEdition}
                nomUtilisateur={nomUtilisateur}
                competences={competencesProfil}
                chargement={chargement}
                onSubmit={modifierProfil}
                onCancel={() => setFormulaireActif(null)}
                onAvatarUpdated={(url) => setProfil((actuel) => actuel ? { ...actuel, avatar_url: url } : actuel)}
              />
            ) : (
              <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-dark">Chargement du profil...</p>
                <p className="mt-2 text-sm text-muted">Le formulaire va apparaître dès que la session sera prête.</p>
              </section>
            )
          )}

          {formulaireActif === "projet" && (
            <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Soumission projet</p>
                  <h2 className="mt-2 text-xl font-bold text-dark">Présentez un projet clair, finançable et crédible</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    L&apos;investisseur doit comprendre le problème, la solution, le marché et le dossier disponible après accès payant.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormulaireActif(null)}
                  className="h-9 rounded-lg border border-border px-4 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
                >
                  Fermer
                </button>
              </div>

              <form className="mt-5 space-y-5" onSubmit={publierProjet}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field name="titre" label="Titre du projet" placeholder="Nom du projet" required />
                  <Field name="secteur" label="Secteur" placeholder="Fintech, Agritech, Edutech..." required />
                  <Field name="pays" label="Pays" placeholder="Gabon" defaultValue={profilEdition?.pays ?? "Gabon"} required />
                  <Field name="budget" label="Budget recherché" placeholder="25000000" required />
                  <FileField name="image" label="Image du projet" accept="image/png,image/jpeg,image/webp" />
                  <FileField name="dossier" label="Dossier complet PDF" accept="application/pdf" />
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-dark">Description courte</span>
                  <textarea
                    name="description"
                    required
                    minLength={20}
                    placeholder="Expliquez en quelques lignes ce que le projet apporte et pourquoi il mérite l'attention."
                    className="mt-2 min-h-28 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-dark">Problème identifié</span>
                    <textarea
                      name="probleme"
                      placeholder="Quel problème réel le projet résout-il ?"
                      className="mt-2 min-h-28 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-dark">Solution proposée</span>
                    <textarea
                      name="solution"
                      placeholder="Comment votre solution répond-elle au problème ?"
                      className="mt-2 min-h-28 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                </div>

                {message && (
                  <p className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                    {message}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={chargement}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
                  >
                    {chargement ? "Publication..." : "Publier le projet"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormulaireActif(null)
                      setMessage("")
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </section>
          )}

          {!formulaireActif && (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {statistiques.map((stat) => (
                  <article key={stat.titre} className="min-h-[130px] rounded-xl border border-border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-sm text-muted">{stat.titre}</h2>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{stat.detail}</span>
                    </div>
                    <p className="mt-7 text-base font-bold text-dark">{stat.valeur}</p>
                  </article>
                ))}
              </div>

              {vue === "projets" && <ProjetsActifs projets={projets} onAjouter={() => setFormulaireActif("projet")} competences={competencesProfil} />}
              {vue === "opportunites" && <Opportunites />}
              {vue === "messagerie" && <MessagerieResume />}
              {vue === "verification" && <Verification score={scoreProfil} profilComplet={Boolean(profil?.bio)} verifie={Boolean(profil?.verifie)} competences={competencesProfil} />}
              {vue === "rapport" && <Rapport projets={projets} score={scoreProfil} profilComplet={Boolean(profil?.bio)} />}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function BadgeCompetence({ skill }: { skill: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-sm hover:shadow-primary/20">
      {skill}
    </span>
  )
}

function FormulaireProfilDashboard({
  profil,
  nomUtilisateur,
  competences,
  chargement,
  onSubmit,
  onCancel,
  onAvatarUpdated,
}: {
  profil: ProfilDeveloppeur
  nomUtilisateur: string
  competences: string[]
  chargement: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onAvatarUpdated: (url: string) => void
}) {
  const [skills, setSkills] = useState<string[]>(competences)
  const [bioLength, setBioLength] = useState((profil.bio ?? "").length)

  return (
    <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Profil développeur</p>
          <h2 className="mt-2 text-xl font-bold text-dark">Modifier mes informations visibles</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Ces informations apparaissent sur votre profil et aident les investisseurs ou entreprises à comprendre votre expertise.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-lg border border-border px-4 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
        >
          Fermer
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-light p-4">
        <DashboardIdentity
          nom={nomUtilisateur}
          sousTitre="Image de profil"
          avatarUrl={profil.avatar_url}
          initiales={initialesProfil(nomUtilisateur)}
          variant="light"
          onAvatarUpdated={onAvatarUpdated}
        />
      </div>

      <form className="mt-5 space-y-5" onSubmit={onSubmit}>
        <div className="rounded-xl border border-border p-4">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-dark">Informations d&apos;inscription</h3>
            <p className="mt-1 text-xs leading-5 text-muted">Les informations de base qui identifient votre profil développeur.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field name="prenom" label="Prénom" placeholder="Prénom" defaultValue={profil.prenom ?? ""} />
            <Field name="nom" label="Nom" placeholder="Nom" defaultValue={profil.nom} />
            <Field
              name="email"
              label="Email du compte"
              type="email"
              placeholder="email@exemple.com"
              defaultValue={profil.email}
              readOnly
              helper="L'email sert à la connexion. Il sera modifiable dans une action sécurisée dédiée."
            />
            <Field name="telephone" label="Téléphone" placeholder="074 00 00 00" defaultValue={profil.telephone ?? ""} />
            <Field name="pays" label="Pays" placeholder="Gabon" defaultValue={profil.pays ?? "Gabon"} />
            <DeveloperTypeSelect defaultValue={profil.developer_type} />
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-dark">Présentation professionnelle</h3>
            <p className="mt-1 text-xs leading-5 text-muted">Cette partie aide les investisseurs et entreprises à comprendre votre valeur rapidement.</p>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-dark">Bio</span>
            <textarea
              name="bio"
              maxLength={bioMaxLength}
              defaultValue={profil.bio ?? ""}
              onChange={(event) => setBioLength(event.target.value.length)}
              placeholder="Présentez votre expertise, vos services et ce que vous savez construire."
              className="mt-2 min-h-28 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <span className="mt-1 block text-right text-xs font-semibold text-muted">
              {bioLength}/{bioMaxLength} caractères
            </span>
          </label>

          <div className="mt-4">
            <SkillsSelector selected={skills} onChange={setSkills} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={chargement}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
          >
            {chargement ? "Enregistrement..." : "Enregistrer mon profil"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
          >
            Annuler
          </button>
        </div>
      </form>
    </section>
  )
}

function ProjetsActifs({ projets, onAjouter, competences }: { projets: ProjetDeveloppeur[]; onAjouter: () => void; competences: string[] }) {
  return (
    <>
      <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-bold text-dark">Compétences visibles</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Elles apparaissent sur votre profil public et dans les recherches entreprises.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {competences.map((skill) => (
              <BadgeCompetence key={skill} skill={skill} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
          <h2 className="text-sm font-bold text-dark">Mes projets actifs</h2>
          <button type="button" onClick={onAjouter} className="text-xs font-semibold text-primary hover:text-primary/80">
            + Ajouter
          </button>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {projets.length === 0 ? (
            <div className="rounded-xl bg-light p-5 xl:col-span-3">
              <p className="text-sm font-semibold text-dark">Aucun projet publié pour le moment.</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Cliquez sur “Nouveau projet” pour publier votre premier projet réel dans le catalogue OkeTech.
              </p>
            </div>
          ) : (
            projets.map((projet) => (
              <article key={projet.id} className="rounded-xl bg-light p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-dark">{projet.titre}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      projet.statut === "brouillon" ? "bg-yellow-100 text-yellow-700" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {statutLisible(projet.statut)}
                  </span>
                </div>
                <div className="mt-5 h-2 rounded-full bg-border">
                  <div className={`h-full rounded-full bg-primary ${progressionClasse(Number(projet.financement_pct ?? 0))}`} />
                </div>
                <p className="mt-2 text-xs text-muted">{Number(projet.financement_pct ?? 0)}% financé · Score {Number(projet.score ?? 0)}/100</p>
                <Link
                  href={`/paiement?type=boost_projet&projet=${projet.id}`}
                  className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-primary bg-white px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  Booster · 10 000 FCFA
                </Link>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Visibilité payante</p>
        <h2 className="mt-2 text-xl font-bold text-dark">Mettez un projet devant plus d&apos;investisseurs</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Le boost place votre projet dans les zones prioritaires du catalogue pendant 7 jours.
        </p>
        <p className="mt-5 text-sm font-semibold text-primary">
          Choisissez un projet dans la liste ci-dessus pour activer son boost.
        </p>
      </section>

      <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-dark">Activité récente</h2>
        <div className="mt-3 h-px bg-border" />

        <div className="mt-4 divide-y divide-border">
          {projets.length === 0 ? (
            <p className="py-4 text-sm text-muted">Votre activité apparaîtra ici après publication de vos projets.</p>
          ) : (
            projets.slice(0, 4).map((projet) => (
              <div key={projet.id} className="flex gap-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-light text-xs text-muted">•</span>
                <div>
                  <p className="text-sm text-dark">Projet publié : {projet.titre}</p>
                  <p className="mt-1 text-xs text-muted">{new Date(projet.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}

function Opportunites() {
  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Opportunités reçues</h2>
      <div className="mt-3 h-px bg-border" />
      <div className="mt-4 rounded-xl bg-light p-5">
        <p className="text-sm font-semibold text-dark">Les opportunités réelles arriveront depuis la messagerie et les accès dossiers.</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Dès qu’un investisseur débloque un dossier ou qu’une entreprise vous contacte, vous pourrez traiter l’opportunité ici.
        </p>
      </div>
    </section>
  )
}

function MessagerieResume() {
  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Messagerie</h2>
      <div className="mt-3 h-px bg-border" />
      <p className="mt-4 text-sm leading-6 text-muted">
        Retrouvez ici les échanges liés à votre profil développeur. Pour ouvrir l’espace complet, utilisez le bouton ci-dessous.
      </p>
      <Link href="/messagerie" className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white">
        Ouvrir la messagerie
      </Link>
    </section>
  )
}

function Verification({
  score,
  profilComplet,
  verifie,
  competences,
}: {
  score: number
  profilComplet: boolean
  verifie: boolean
  competences: string[]
}) {
  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Vérification et crédibilité</h2>
      <div className="mt-3 h-px bg-border" />
      <p className="mt-5 text-center text-sm font-bold text-primary">{score}%</p>
      <p className="mt-5 text-center text-xs uppercase text-muted">Score confiance</p>
      <div className="mt-2 h-3 rounded-full bg-border">
        <div className={`h-full rounded-full bg-primary ${progressionClasse(score)}`} />
      </div>
      <ul className="mt-5 grid gap-3 text-sm text-muted md:grid-cols-3">
        <li className="rounded-xl bg-light p-4">{verifie ? "Identité vérifiée" : "Identité à vérifier"}</li>
        <li className="rounded-xl bg-light p-4">{profilComplet ? "Profil complété" : "Profil à compléter"}</li>
        <li className="rounded-xl bg-light p-4">Projet à enrichir</li>
      </ul>
      <div className="mt-5">
        <p className="text-sm font-bold text-dark">Compétences du profil</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {competences.map((skill) => (
            <BadgeCompetence key={skill} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Rapport({ projets, score, profilComplet }: { projets: ProjetDeveloppeur[]; score: number; profilComplet: boolean }) {
  const priorite = !profilComplet
    ? "Compléter votre bio développeur pour renforcer la confiance."
    : projets.length === 0
      ? "Publier votre premier projet avec image et dossier PDF."
      : "Enrichir chaque projet avec un dossier clair et une image lisible."

  return (
    <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Rapport de performance</h2>
      <div className="mt-3 h-px bg-border" />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-light p-4">
          <p className="text-xs font-semibold uppercase text-muted">Résumé</p>
          <p className="mt-3 text-sm leading-6 text-dark">
            Vous avez {projets.length} projet{projets.length > 1 ? "s" : ""} publié{projets.length > 1 ? "s" : ""} et un score de {score}%.
          </p>
        </article>
        <article className="rounded-xl bg-light p-4">
          <p className="text-xs font-semibold uppercase text-muted">Priorité</p>
          <p className="mt-3 text-sm leading-6 text-dark">{priorite}</p>
        </article>
        <article className="rounded-xl bg-light p-4">
          <p className="text-xs font-semibold uppercase text-muted">Objectif</p>
          <p className="mt-3 text-sm leading-6 text-dark">Atteindre un score de crédibilité supérieur à 90% avant la mise en relation.</p>
        </article>
      </div>
    </section>
  )
}
