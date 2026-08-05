"use client"

import Image from "next/image"
import Link from "next/link"
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react"
import DeveloperTypeSelect, { typesDeveloppeur } from "@/components/ui/DeveloperTypeSelect"
import SkillsSelector, { competencesDisponibles } from "@/components/ui/SkillsSelector"
import { createClient } from "@/lib/supabase/client"

type Onglet = "projets" | "competences" | "apropos"
type Mode = "profil" | "projet" | null

interface Profil {
  id: string
  nom: string
  prenom: string | null
  pays: string | null
  bio: string | null
  score: number
  verifie: boolean
  premium: boolean
  developer_type: string | null
  skills: string[] | null
  avatar_url: string | null
}

interface Projet {
  id: string
  titre: string
  secteur: string
  pays: string
  description: string
  statut: string
  financement_pct: number
  score: number
  created_at: string
}

const onglets: { id: Onglet; label: string }[] = [
  { id: "projets", label: "Projets récents" },
  { id: "competences", label: "Compétences" },
  { id: "apropos", label: "À propos" },
]

const competencesParDefaut = ["React", "Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"]
const bioMaxLength = 500

function progressionClasse(valeur: number) {
  if (valeur >= 90) return "w-[90%]"
  if (valeur >= 80) return "w-[80%]"
  if (valeur >= 70) return "w-[70%]"
  if (valeur >= 60) return "w-[60%]"
  if (valeur >= 40) return "w-[40%]"
  if (valeur >= 20) return "w-[20%]"
  return "w-[10%]"
}

function Field({
  label,
  placeholder,
  type = "text",
  defaultValue,
  name,
}: {
  label: string
  placeholder: string
  type?: string
  defaultValue?: string
  name: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-dark">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-dark outline-none transition focus:border-primary"
      />
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

export default function ProfilPage() {
  const [ongletActif, setOngletActif] = useState<Onglet>("projets")
  const [mode, setMode] = useState<Mode>(null)
  const [message, setMessage] = useState("")
  const [profil, setProfil] = useState<Profil | null>(null)
  const [projets, setProjets] = useState<Projet[]>([])
  const [chargement, setChargement] = useState(true)
  const [soumission, setSoumission] = useState(false)

  async function chargerProfil() {
    setChargement(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const profileAdvanced = await supabase
        .from("profiles")
        .select("id, nom, prenom, pays, bio, score, verifie, premium, developer_type, skills, avatar_url")
        .eq("id", user.id)
        .single()
      const profileFallback = profileAdvanced.error
        ? await supabase
            .from("profiles")
            .select("id, nom, prenom, pays, bio, score, verifie, premium, avatar_url")
            .eq("id", user.id)
            .single()
        : profileAdvanced

      const projetsResult = await supabase
        .from("projets")
        .select("id, titre, secteur, pays, description, statut, financement_pct, score, created_at")
        .eq("developpeur_id", user.id)
        .order("created_at", { ascending: false })

      if (profileFallback.data) {
        const profileData = profileFallback.data as Profil
        setProfil({
          ...profileData,
          developer_type: "developer_type" in profileData && typeof profileData.developer_type === "string" ? profileData.developer_type : null,
          skills: "skills" in profileData && Array.isArray(profileData.skills) ? profileData.skills : null,
        })
      }
      if (projetsResult.data) setProjets(projetsResult.data as Projet[])
    } catch {
      setProfil(null)
      setProjets([])
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void chargerProfil()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const nomComplet = `${profil?.prenom ?? ""} ${profil?.nom ?? ""}`.trim() || "Développeur OkeTech"
  const titreDeveloppeur = profil?.developer_type ? `Développeur ${profil.developer_type}` : "Développeur"
  const initiales = nomComplet.slice(0, 2).toUpperCase()
  const score = Number(profil?.score ?? 0)
  const competencesProfil = profil?.skills?.length ? profil.skills : competencesParDefaut
  const projetsTermines = useMemo(() => projets.filter((projet) => projet.statut === "financé").length, [projets])

  async function modifierProfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSoumission(true)

    const formData = new FormData(event.currentTarget)
    const bio = String(formData.get("bio") ?? "").trim().slice(0, bioMaxLength)
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
        setMessage("Session expirée. Reconnectez-vous.")
        return
      }

      const payload = {
        prenom: String(formData.get("prenom") ?? "").trim(),
        nom: String(formData.get("nom") ?? "").trim(),
        pays: String(formData.get("pays") ?? "").trim(),
        developer_type: String(formData.get("developer_type") ?? "").trim(),
        bio,
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
      setMode(null)
      await chargerProfil()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mise à jour impossible.")
    } finally {
      setSoumission(false)
    }
  }

  async function publierProjet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSoumission(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        setMessage("Session expirée. Reconnectez-vous.")
        return
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const result = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        setMessage(result?.message ?? "Publication impossible.")
        return
      }

      setMessage("Projet publié. Il apparaît maintenant dans le catalogue.")
      setMode(null)
      form.reset()
      await chargerProfil()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publication impossible.")
    } finally {
      setSoumission(false)
    }
  }

  return (
    <main className="bg-light">
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1760px] px-6 py-8 sm:px-8 lg:px-12 2xl:px-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-5">
              <ProfilAvatar
                avatarUrl={profil?.avatar_url}
                initiales={initiales}
                onAvatarUpdated={(url) => setProfil((actuel) => actuel ? { ...actuel, avatar_url: url } : actuel)}
              />
              <div>
                <h1 className="text-lg font-bold text-dark">{nomComplet}</h1>
                <p className="mt-3 text-sm text-muted">{titreDeveloppeur} · {profil?.pays ?? "Pays à préciser"}</p>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {profil?.verifie ? "Identité vérifiée" : "Identité à vérifier"} · {profil?.premium ? "Profil premium" : "Profil standard"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {competencesProfil.length > 0 ? competencesProfil.map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {tag}
                    </span>
                  )) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">
                      Compétences à renseigner
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode("profil")
                setMessage("")
              }}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Modifier mon profil
            </button>
          </div>

          <nav className="mt-8 flex gap-8 overflow-x-auto text-sm" aria-label="Navigation profil">
            {onglets.map((onglet) => (
              <button
                key={onglet.id}
                type="button"
                onClick={() => {
                  setOngletActif(onglet.id)
                  setMode(null)
                  setMessage("")
                }}
                className={`min-w-max border-b-2 pb-4 transition ${
                  ongletActif === onglet.id && !mode ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary"
                }`}
              >
                {onglet.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1760px] gap-6 px-6 py-5 sm:px-8 lg:grid-cols-[1fr_430px] lg:px-12 2xl:px-20">
        <div className="space-y-5">
          {message && <div className="rounded-xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-semibold text-primary">{message}</div>}
          {chargement && <div className="rounded-xl border border-border bg-white p-5 text-sm text-muted shadow-sm">Chargement du profil...</div>}
          {mode === "profil" && profil && (
            <FormulaireProfil profil={profil} chargement={soumission} onSubmit={modifierProfil} onCancel={() => setMode(null)} />
          )}
          {mode === "projet" && (
            <FormulaireProjet chargement={soumission} onSubmit={publierProjet} onCancel={() => setMode(null)} />
          )}
          {!chargement && !mode && ongletActif === "projets" && <ProjetsSection profil={profil} projets={projets} />}
          {!chargement && !mode && ongletActif === "competences" && <CompetencesSection score={score} skills={competencesProfil} />}
          {!chargement && !mode && ongletActif === "apropos" && <AproposSection profil={profil} />}
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-dark">Jauge de Crédibilité</h2>
            <div className="mt-3 h-px bg-border" />
            <p className="mt-5 text-center text-sm font-bold text-primary">{score}%</p>
            <p className="mt-5 text-center text-xs uppercase text-muted">Score confiance</p>
            <div className="mt-3 h-3 rounded-full bg-border">
              <div className={`h-full rounded-full bg-primary ${progressionClasse(score)}`} />
            </div>
            <ul className="mt-5 space-y-2 text-sm text-primary">
              <li>{profil?.verifie ? "✓ Identité vérifiée" : "• Identité à vérifier"}</li>
              <li>✓ {projetsTermines} projet financé</li>
              <li>{profil?.bio ? "✓ Profil complet" : "• Profil à compléter"}</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-dark">Disponibilité & contact</h2>
            <div className="mt-3 h-px bg-border" />
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>Disponible à la mise en relation via OkeTech</p>
              <p>Les échanges passent par la messagerie sécurisée</p>
              <p>Projets publiés : {projets.length}</p>
            </div>
            <Link href="/messagerie" className="mt-5 flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
              Envoyer un message
            </Link>
          </section>

          <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-dark">Actions rapides</h2>
            <div className="mt-3 h-px bg-border" />
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode("projet")
                  setMessage("")
                }}
                className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                + Soumettre un projet
              </button>
              <Link href="/messagerie" className="flex h-10 items-center justify-center rounded-lg border border-border bg-white px-5 text-sm font-semibold text-muted transition-colors hover:border-primary hover:text-primary">
                Mes messages
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}

function ProjetsSection({ profil, projets }: { profil: Profil | null; projets: Projet[] }) {
  return (
    <>
      <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Résumé professionnel</p>
            <h2 className="mt-3 text-2xl font-bold text-dark">Profil développeur OkeTech</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {profil?.bio || "Complétez votre bio pour expliquer votre expertise, votre vision et le type de projets que vous souhaitez développer."}
            </p>
          </div>

          <Link href="/messagerie" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90">
            Contacter ce développeur
          </Link>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Projets publiés", String(projets.length)],
            ["Score", `${Number(profil?.score ?? 0)}%`],
            ["Pays", profil?.pays ?? "À préciser"],
            ["Statut", profil?.verifie ? "Vérifié" : "À vérifier"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-light p-4">
              <p className="text-xs font-semibold uppercase text-muted">{label}</p>
              <p className="mt-2 text-sm font-bold text-dark">{value}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-dark">Projets récents</h2>
        <div className="mt-3 h-px bg-border" />

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {projets.length === 0 ? (
            <p className="rounded-xl bg-light p-5 text-sm leading-6 text-muted md:col-span-2">
              Aucun projet publié. Utilisez “Soumettre un projet” pour alimenter le catalogue réel.
            </p>
          ) : (
            projets.map((projet) => (
              <div key={projet.id} className="overflow-hidden rounded-xl bg-light">
                <div className="flex h-[130px] items-center justify-center bg-dark text-sm font-bold text-white">{projet.secteur}</div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-dark">{projet.titre}</h3>
                  <p className="mt-3 line-clamp-2 text-sm text-muted">{projet.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{projet.statut}</span>
                    <Link href={`/projets/${projet.id}`} className="inline-flex h-7 min-w-24 items-center justify-center rounded-full border border-border bg-white px-4 text-xs font-semibold text-primary hover:border-primary">
                      Voir
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </>
  )
}

function CompetencesSection({ score, skills }: { score: number; skills: string[] }) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Compétences techniques</h2>
      <div className="mt-3 h-px bg-border" />
      {skills.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Ajoutez vos compétences depuis “Modifier mon profil” pour rendre votre profil plus lisible auprès des investisseurs et entreprises.
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {skill}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 h-3 rounded-full bg-border">
        <div className={`h-full rounded-full bg-primary ${progressionClasse(score)}`} />
      </div>
    </article>
  )
}

function AproposSection({ profil }: { profil: Profil | null }) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">À propos</h2>
      <div className="mt-3 h-px bg-border" />
      <p className="mt-4 text-sm leading-7 text-muted">
        {profil?.bio || "Ce développeur n’a pas encore complété sa présentation. Cette zone sera alimentée depuis les informations du profil."}
      </p>
    </article>
  )
}

function ProfilAvatar({
  avatarUrl,
  initiales,
  onAvatarUpdated,
}: {
  avatarUrl?: string | null
  initiales: string
  onAvatarUpdated: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState("")
  const [chargement, setChargement] = useState(false)

  async function changerAvatar(event: ChangeEvent<HTMLInputElement>) {
    const fichier = event.target.files?.[0]
    if (!fichier) return

    setChargement(true)
    setMessage("")

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        setMessage("Session expirée.")
        return
      }

      const formData = new FormData()
      formData.append("avatar", fichier)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const result = (await response.json().catch(() => null)) as { avatarUrl?: string; message?: string } | null

      if (!response.ok || !result?.avatarUrl) {
        setMessage(result?.message ?? "Import impossible.")
        return
      }

      onAvatarUpdated(result.avatarUrl)
      setMessage("Image mise à jour.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import impossible.")
    } finally {
      setChargement(false)
      event.target.value = ""
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-bold text-white ring-1 ring-border transition hover:ring-primary sm:h-24 sm:w-24"
        aria-label="Changer la photo du profil"
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" fill sizes="96px" unoptimized className="object-cover" />
        ) : (
          <span>{initiales}</span>
        )}
        <span className="absolute inset-0 hidden items-center justify-center bg-dark/60 text-[11px] font-semibold text-white group-hover:flex">
          Modifier
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={changerAvatar} />
      {(chargement || message) && (
        <p className="mt-2 max-w-24 text-center text-[11px] font-semibold text-primary">
          {chargement ? "Import..." : message}
        </p>
      )}
    </div>
  )
}

function FormulaireProfil({
  profil,
  chargement,
  onSubmit,
  onCancel,
}: {
  profil: Profil
  chargement: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  const [skills, setSkills] = useState<string[]>(profil.skills?.length ? profil.skills : competencesParDefaut)
  const [bioLength, setBioLength] = useState((profil.bio ?? "").length)

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Modifier mon profil</h2>
      <div className="mt-3 h-px bg-border" />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field name="prenom" label="Prénom" placeholder="Prénom" defaultValue={profil.prenom ?? ""} />
        <Field name="nom" label="Nom" placeholder="Nom" defaultValue={profil.nom} />
        <Field name="pays" label="Pays" placeholder="Gabon" defaultValue={profil.pays ?? ""} />
        <DeveloperTypeSelect defaultValue={profil.developer_type} />
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-dark">Présentation</span>
        <textarea
          name="bio"
          placeholder="Présentez votre expertise, vos projets et ce que vous recherchez."
          defaultValue={profil.bio ?? ""}
          maxLength={bioMaxLength}
          onChange={(event) => setBioLength(event.target.value.length)}
          className="mt-2 min-h-32 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary"
        />
        <span className="mt-1 block text-right text-xs font-semibold text-muted">
          {bioLength}/{bioMaxLength} caractères
        </span>
      </label>

      <div className="mt-4">
        <SkillsSelector selected={skills} onChange={setSkills} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={chargement} className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:bg-primary/70">
          {chargement ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary">
          Annuler
        </button>
      </div>
    </form>
  )
}

function FormulaireProjet({
  chargement,
  onSubmit,
  onCancel,
}: {
  chargement: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-dark">Soumettre un projet</h2>
      <div className="mt-3 h-px bg-border" />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field name="titre" label="Titre du projet" placeholder="Nom du projet" />
        <Field name="secteur" label="Secteur" placeholder="Fintech, Edutech, Agritech..." />
        <Field name="pays" label="Pays" placeholder="Gabon" />
        <Field name="budget" label="Budget recherché" placeholder="25000000" />
        <FileField name="image" label="Image du projet" accept="image/png,image/jpeg,image/webp" />
        <FileField name="dossier" label="Dossier complet PDF" accept="application/pdf" />
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-dark">Description courte</span>
        <textarea
          name="description"
          placeholder="Expliquez le problème, la solution et l'impact du projet."
          className="mt-2 min-h-32 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary"
        />
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-dark">Problème identifié</span>
          <textarea name="probleme" placeholder="Décrivez le problème que votre projet résout." className="mt-2 min-h-28 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-dark">Solution proposée</span>
          <textarea name="solution" placeholder="Expliquez votre solution et son impact." className="mt-2 min-h-28 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary" />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={chargement} className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:bg-primary/70">
          {chargement ? "Publication..." : "Publier le projet"}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary">
          Annuler
        </button>
      </div>
    </form>
  )
}
