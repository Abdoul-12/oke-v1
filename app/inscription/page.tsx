"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"
import DeveloperTypeSelect, { typesDeveloppeur } from "@/components/ui/DeveloperTypeSelect"
import SkillsSelector from "@/components/ui/SkillsSelector"
import { createClient } from "@/lib/supabase/client"
import {
  sanitizeText,
  validateEmail,
  validatePassword,
  validatePhone,
  validateSafeText,
} from "@/lib/security/input"

type Role = "developpeur" | "investisseur" | "entreprise"
type Etape = 1 | 2 | 3
type IconeRole = "code" | "croissance" | "batiment"

interface InscriptionData {
  prenom: string
  nom: string
  email: string
  telephone: string
  pays: string
  indicatif: string
  developer_type: string
  skills: string[]
}

interface RoleConfig {
  id: Role
  nom: string
  couleur: string
  fond: string
  icone: IconeRole
  descriptionCourte: string
  description: string
  titre: string
  avantages: string[]
}

const roles: RoleConfig[] = [
  {
    id: "developpeur",
    nom: "Développeur",
    couleur: "bg-secondary",
    fond: "bg-secondary/10",
    icone: "code",
    descriptionCourte: "Accédez aux meilleurs projets.",
    description:
      "Créez un profil crédible, soumettez vos projets et attirez les partenaires capables de financer votre croissance.",
    titre: "Ton talent mérite d'être vu et financé",
    avantages: [
      "Profil visible par 150+ investisseurs",
      "Soumission de projets avec score de crédibilité",
      "Messagerie directe sécurisée",
      "Dashboard avec analytics en temps réel",
    ],
  },
  {
    id: "investisseur",
    nom: "Investisseur",
    couleur: "bg-primary",
    fond: "bg-primary/10",
    icone: "croissance",
    descriptionCourte: "Découvrez des projets à fort potentiel.",
    description:
      "Explorez des projets africains qualifiés, consultez les dossiers complets et échangez directement avec les porteurs.",
    titre: "Investissez dans les projets qui vont changer l'Afrique",
    avantages: [
      "Accès aux dossiers complets des meilleurs projets",
      "Scoring et vérification des développeurs",
      "Messagerie directe avec les porteurs de projets",
      "Tableau de bord de suivi de portefeuille",
    ],
  },
  {
    id: "entreprise",
    nom: "Entreprise",
    couleur: "bg-violet-600",
    fond: "bg-violet-600/10",
    icone: "batiment",
    descriptionCourte: "Recrutez des développeurs.",
    description:
      "Trouvez des talents tech africains vérifiés, publiez vos besoins et échangez avec les profils les plus pertinents.",
    titre: "Les meilleurs talents africains vous attendent",
    avantages: [
      "Accès à 1000+ développeurs vérifiés et scorés",
      "Publication d'offres illimitées",
      "Messagerie directe avec les talents",
      "Recommandations basées sur vos besoins",
    ],
  },
]

const paysAfricains = [
  { nom: "Gabon", indicatif: "+241", exemple: "74 00 00 00" },
  { nom: "Cameroun", indicatif: "+237", exemple: "6 00 00 00 00" },
  { nom: "Côte d'Ivoire", indicatif: "+225", exemple: "07 00 00 00 00" },
  { nom: "Sénégal", indicatif: "+221", exemple: "77 000 00 00" },
  { nom: "Bénin", indicatif: "+229", exemple: "01 00 00 00 00" },
  { nom: "Togo", indicatif: "+228", exemple: "90 00 00 00" },
  { nom: "Rwanda", indicatif: "+250", exemple: "78 000 0000" },
  { nom: "Maroc", indicatif: "+212", exemple: "06 00 00 00 00" },
  { nom: "Mali", indicatif: "+223", exemple: "70 00 00 00" },
  { nom: "Burkina Faso", indicatif: "+226", exemple: "70 00 00 00" },
]

function Particules() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute left-[8%] top-[14%] h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_18px_rgba(37,99,235,0.9)]" />
      <span className="absolute left-[20%] top-[72%] h-1 w-1 rounded-full bg-primary shadow-[0_0_16px_rgba(15,138,122,0.9)]" />
      <span className="absolute left-[42%] top-[18%] h-1 w-1 rounded-full bg-white/70 shadow-[0_0_14px_rgba(255,255,255,0.7)]" />
      <span className="absolute left-[60%] top-[82%] h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_18px_rgba(37,99,235,0.9)]" />
      <span className="absolute left-[78%] top-[24%] h-1 w-1 rounded-full bg-primary shadow-[0_0_16px_rgba(15,138,122,0.9)]" />
      <span className="absolute left-[88%] top-[66%] h-1.5 w-1.5 rounded-full bg-white/60 shadow-[0_0_16px_rgba(255,255,255,0.7)]" />
      <span className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      <span className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
    </div>
  )
}

function Logo() {
  return (
    <Link href="/" className="relative z-10 inline-flex items-center gap-2" aria-label="Accueil OkeTech">
      <span className="flex h-9 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
        OKE
      </span>
      <span className="text-xl font-bold text-white">Tech</span>
    </Link>
  )
}

function RoleIcon({ icone }: { icone: IconeRole }) {
  if (icone === "code") {
    return (
      <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="none">
        <path d="m8.5 8-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m15.5 8 4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m13.5 5-3 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (icone === "croissance") {
    return (
      <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="none">
        <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 16V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M11 16v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 16V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="m7 8 4 2.5L17 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 5h-3.5M17 5v3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="none">
      <path d="M4.5 20V7.5A2.5 2.5 0 0 1 7 5h10a2.5 2.5 0 0 1 2.5 2.5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 9h2M14 9h2M8 13h2M14 13h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 20v-3a2 2 0 0 1 4 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Progression({ etape }: { etape: Etape }) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[320px]">
      <div className="mb-2 text-center text-[11px] font-medium text-white/70">Étape {etape} sur 3</div>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-secondary transition-all"
          style={{ width: etape === 1 ? "33%" : etape === 2 ? "66%" : "100%" }}
        />
      </div>
    </div>
  )
}

export default function InscriptionPage() {
  const router = useRouter()
  const [etape, setEtape] = useState<Etape>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [erreur, setErreur] = useState("")
  const [chargement, setChargement] = useState(false)
  const [donnees, setDonnees] = useState<InscriptionData | null>(null)
  const [motDePasseFinal, setMotDePasseFinal] = useState("")
  const [paysSelectionne, setPaysSelectionne] = useState("Gabon")
  const [competencesSelectionnees, setCompetencesSelectionnees] = useState<string[]>([])

  const roleActif = useMemo(() => roles.find((item) => item.id === role) ?? roles[0], [role])
  const paysActif = useMemo(
    () => paysAfricains.find((item) => item.nom === paysSelectionne) ?? paysAfricains[0],
    [paysSelectionne]
  )

  function choisirRole(roleChoisi: Role) {
    setRole(roleChoisi)
    setErreur("")
    setDonnees(null)
    setCompetencesSelectionnees([])
    setEtape(2)
  }

  function soumettreInscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur("")

    const formData = new FormData(event.currentTarget)
    const prenom = validateSafeText("Le prénom", String(formData.get("prenom") ?? ""), 2, 60)
    const nom = validateSafeText("Le nom", String(formData.get("nom") ?? ""), 2, 80)
    const email = validateEmail(String(formData.get("email") ?? ""))
    const telephone = validatePhone(String(formData.get("telephone") ?? ""))
    const pays = sanitizeText(formData.get("pays"), 60)
    const indicatif = paysAfricains.find((item) => item.nom === pays)?.indicatif ?? "+241"
    const developerType = sanitizeText(formData.get("developer_type"), 40)
    const motDePasse = String(formData.get("motDePasse") ?? "")
    const confirmation = String(formData.get("confirmation") ?? "")
    const cgu = formData.get("cgu")
    const password = validatePassword(motDePasse)

    if (!paysAfricains.some((item) => item.nom === pays)) {
      setErreur("Sélectionnez un pays valide dans la liste.")
      return
    }

    if (!prenom.ok) {
      setErreur(prenom.message)
      return
    }

    if (!nom.ok) {
      setErreur(nom.message)
      return
    }

    if (!email.ok) {
      setErreur(email.message)
      return
    }

    if (!telephone.ok) {
      setErreur(telephone.message)
      return
    }

    if (!password.ok) {
      setErreur(password.message)
      return
    }

    if (!confirmation) {
      setErreur("Confirmez votre mot de passe pour continuer.")
      return
    }

    if (motDePasse !== confirmation) {
      setErreur("Les mots de passe ne correspondent pas.")
      return
    }

    if (!cgu) {
      setErreur("Vous devez accepter les conditions générales pour créer votre compte.")
      return
    }

    if (role === "developpeur" && !typesDeveloppeur.includes(developerType as (typeof typesDeveloppeur)[number])) {
      setErreur("Sélectionnez votre type de développeur.")
      return
    }

    setDonnees({
      prenom: prenom.value,
      nom: nom.value,
      email: email.value,
      telephone: telephone.value,
      pays,
      indicatif,
      developer_type: role === "developpeur" ? developerType : "",
      skills: role === "developpeur" ? competencesSelectionnees : [],
    })
    setMotDePasseFinal(password.value)
    setEtape(3)
  }

  async function finaliserInscription() {
    setErreur("")
    setChargement(true)

    if (!role || !donnees || !motDePasseFinal) {
      setChargement(false)
      setErreur("Informations d'inscription incomplètes. Retournez à l'étape précédente.")
      return
    }

    try {
      const supabase = createClient()
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          nom: donnees.nom,
          prenom: donnees.prenom,
          email: donnees.email,
          telephone: donnees.telephone,
          indicatif: donnees.indicatif,
          pays: donnees.pays,
          developer_type: donnees.developer_type,
          skills: donnees.skills,
          password: motDePasseFinal,
        }),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { message?: string } | null
        setErreur(result?.message ?? "Création du compte impossible pour le moment.")
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: donnees.email,
        password: motDePasseFinal,
      })

      if (error) {
        setErreur(error.message)
        return
      }

      router.push(`/dashboard/${role}`)
      router.refresh()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Création du compte impossible pour le moment.")
    } finally {
      setChargement(false)
    }
  }

  if (etape === 1) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-[#050D2D] px-5 py-5 text-white sm:px-8 lg:h-dvh lg:px-12 lg:py-6">
        <Particules />

        <div className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between">
          <Logo />
          <Link href="/connexion" className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:inline">
            Se connecter
          </Link>
        </div>

        <section className="relative z-10 mx-auto flex w-full max-w-[1080px] flex-col justify-center py-8 lg:h-[calc(100dvh-84px)] lg:py-4">
          <Progression etape={1} />

          <div className="mx-auto mt-7 max-w-[560px] text-center">
            <h1 className="text-[30px] font-bold leading-tight text-white sm:text-[38px]">Qui êtes-vous ?</h1>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Choisissez votre profil pour personnaliser votre expérience OkeTech.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => choisirRole(item.id)}
                className="group flex min-h-[292px] flex-col rounded-xl border border-white/10 bg-white p-4 text-left text-dark shadow-2xl shadow-black/20 transition-transform hover:-translate-y-1 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className={`flex h-14 items-center justify-center rounded-lg ${item.couleur} text-white`}>
                  <RoleIcon icone={item.icone} />
                </div>
                <h2 className="mt-4 text-base font-bold text-dark">{item.nom}</h2>
                <p className="mt-2 min-h-10 text-[13px] leading-5 text-muted">{item.descriptionCourte}</p>
                <ul className="mt-4 space-y-2 text-[13px] leading-5 text-muted">
                  {item.avantages.slice(0, 3).map((avantage) => (
                    <li key={avantage} className="flex gap-2">
                      <span className="mt-0.5 text-primary">✓</span>
                      <span>{avantage}</span>
                    </li>
                  ))}
                </ul>
                <span className={`mt-auto flex h-10 items-center justify-center rounded-lg ${item.couleur} px-4 text-[13px] font-semibold text-white transition-opacity group-hover:opacity-90`}>
                  Continuer comme {item.nom} →
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-white/70">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-semibold text-white transition-colors hover:text-primary">
              Se connecter
            </Link>
          </p>
        </section>
      </main>
    )
  }

  if (etape === 2) {
    return (
    <main className="min-h-dvh bg-white lg:grid lg:grid-cols-[40%_60%]">
      <section className="relative overflow-hidden bg-[#050D2D] px-6 py-7 text-white sm:px-8 lg:min-h-dvh lg:px-9 lg:py-6 xl:px-10">
        <Particules />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <Logo />

          <div className="min-h-0">
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3.5">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${roleActif.couleur} text-white`}>
                  <RoleIcon icone={roleActif.icone} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Profil sélectionné</p>
                  <p className="text-base font-bold text-white">{roleActif.nom}</p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h1 className="max-w-[430px] text-[27px] font-bold leading-tight text-white sm:text-[32px] lg:text-[29px] xl:text-[32px]">{roleActif.titre}</h1>
              <p className="mt-3 max-w-[450px] text-[13px] leading-6 text-white/70 xl:text-sm">{roleActif.description}</p>
            </div>

            <ul className="mt-5 space-y-2.5 text-[13px] leading-5 text-white/80 xl:text-sm">
              {roleActif.avantages.map((avantage) => (
                <li key={avantage} className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>{avantage}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid grid-cols-3 gap-3 border-y border-white/10 py-3 text-center">
              <div>
                <p className="text-lg font-bold text-primary">1000+</p>
                <p className="mt-0.5 text-[11px] text-white/60">Devs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">150+</p>
                <p className="mt-0.5 text-[11px] text-white/60">Investisseurs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">500+</p>
                <p className="mt-0.5 text-[11px] text-white/60">Projets</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Progression etape={2} />
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-white px-6 py-8 sm:px-8 lg:min-h-dvh lg:px-10 lg:py-8 xl:px-14">
        <div className="w-full max-w-[620px]">
          <div>
            <h2 className="text-[28px] font-bold leading-tight text-dark sm:text-[32px]">Créez votre compte</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Rejoignez l&apos;écosystème tech africain en quelques minutes.
            </p>
          </div>

          {erreur && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
              {erreur}
            </p>
          )}

          <form className="mt-6 space-y-4" onSubmit={soumettreInscription}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="prenom" className="mb-1.5 block text-[13px] font-semibold text-dark">Prénom</label>
                <input id="prenom" name="prenom" required placeholder="Prénom" className="h-11 w-full rounded-lg border border-border px-4 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label htmlFor="nom" className="mb-1.5 block text-[13px] font-semibold text-dark">Nom</label>
                <input id="nom" name="nom" required placeholder="Nom" className="h-11 w-full rounded-lg border border-border px-4 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-dark">Adresse email</label>
              <input id="email" name="email" type="email" required placeholder="votre@email.com" className="h-11 w-full rounded-lg border border-border px-4 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="telephone" className="mb-1.5 block text-[13px] font-semibold text-dark">Téléphone</label>
                <div className="flex h-11 overflow-hidden rounded-lg border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <span className="flex min-w-[72px] items-center justify-center border-r border-border bg-light px-3 text-sm font-semibold text-dark">
                    {paysActif.indicatif}
                  </span>
                  <input id="telephone" name="telephone" required placeholder={paysActif.exemple} className="min-w-0 flex-1 px-4 text-sm text-dark outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <div>
                <label htmlFor="pays" className="mb-1.5 block text-[13px] font-semibold text-dark">Pays</label>
                <select
                  id="pays"
                  name="pays"
                  value={paysSelectionne}
                  onChange={(event) => setPaysSelectionne(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-dark outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {paysAfricains.map((pays) => (
                    <option key={pays.nom} value={pays.nom}>{pays.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="motDePasse" className="mb-1.5 block text-[13px] font-semibold text-dark">Mot de passe</label>
                <input id="motDePasse" name="motDePasse" type="password" required placeholder="Minimum 8 caractères" className="h-11 w-full rounded-lg border border-border px-4 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label htmlFor="confirmation" className="mb-1.5 block text-[13px] font-semibold text-dark">Confirmer le mot de passe</label>
                <input id="confirmation" name="confirmation" type="password" required placeholder="Répétez le mot de passe" className="h-11 w-full rounded-lg border border-border px-4 text-sm text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
            </div>

            {role === "developpeur" && (
              <div className="space-y-4">
                <DeveloperTypeSelect required />
                <SkillsSelector
                  selected={competencesSelectionnees}
                  onChange={setCompetencesSelectionnees}
                />
              </div>
            )}

            <label htmlFor="cgu" className="flex items-start gap-3 text-[13px] leading-5 text-muted">
              <input id="cgu" name="cgu" type="checkbox" required className="mt-1 h-4 w-4 rounded border-border text-primary accent-primary" />
              <span>
                J&apos;accepte les{" "}
                <Link href="/cgu" className="font-semibold text-primary hover:text-primary/80">conditions générales d&apos;utilisation</Link>
                {" "}et la{" "}
                <Link href="/confidentialite" className="font-semibold text-primary hover:text-primary/80">politique de confidentialité</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={chargement}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
            >
              {chargement ? "Création du compte..." : "Créer mon compte OkeTech →"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setEtape(1)
              setErreur("")
              setDonnees(null)
              setMotDePasseFinal("")
            }}
            className="mt-4 text-sm font-semibold text-muted transition-colors hover:text-primary"
          >
            ← Retour au choix du profil
          </button>
        </div>
      </section>
    </main>
    )
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#050D2D] px-5 py-8 text-white sm:px-8 lg:py-10">
      <Particules />

      <section className="relative z-10 flex w-full max-w-[760px] flex-col justify-center">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/connexion" className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:inline">
            Se connecter
          </Link>
        </div>

        <div className="mt-6">
          <Progression etape={3} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white p-5 text-dark shadow-2xl shadow-black/25 sm:p-6">
          <div className="text-center">
            <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${roleActif.couleur} text-white`}>
              <RoleIcon icone={roleActif.icone} />
            </span>
            <h1 className="mt-3 text-[26px] font-bold leading-tight text-dark sm:text-[30px]">Vérifiez votre inscription</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Confirmez vos informations avant la création de votre compte OkeTech.
            </p>
          </div>

          {erreur && (
            <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
              {erreur}
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-light p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Profil</p>
              <p className="mt-1 text-base font-bold text-dark">{roleActif.nom}</p>
            </div>
            <div className="rounded-xl border border-border bg-light p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Nom complet</p>
              <p className="mt-1 text-base font-bold text-dark">{donnees ? `${donnees.prenom} ${donnees.nom}` : "Non renseigné"}</p>
            </div>
            <div className="rounded-xl border border-border bg-light p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Email</p>
              <p className="mt-1 break-words text-base font-bold text-dark">{donnees?.email ?? "Non renseigné"}</p>
            </div>
            <div className="rounded-xl border border-border bg-light p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Téléphone</p>
              <p className="mt-1 text-base font-bold text-dark">{donnees ? `${donnees.indicatif} ${donnees.telephone}` : "Non renseigné"}</p>
            </div>
            <div className="rounded-xl border border-border bg-light p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pays</p>
              <p className="mt-1 text-base font-bold text-dark">{donnees?.pays ?? "Gabon"}</p>
            </div>
            {role === "developpeur" && (
              <div className="rounded-xl border border-border bg-light p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Type de développeur</p>
                <p className="mt-1 text-base font-bold text-dark">{donnees?.developer_type || "Non renseigné"}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Compétences</p>
                <p className="mt-1 text-base font-bold text-dark">
                  {donnees?.skills.length ? donnees.skills.join(", ") : "Non renseignées"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <button
              type="button"
              onClick={() => {
                setEtape(2)
                setErreur("")
                setMotDePasseFinal("")
              }}
              className="flex h-12 items-center justify-center rounded-lg border border-border bg-white px-5 text-sm font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
            >
              ← Modifier
            </button>
            <button
              type="button"
              onClick={finaliserInscription}
              disabled={chargement}
              className="flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
            >
              {chargement ? "Création du compte..." : "Confirmer et créer le compte →"}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
