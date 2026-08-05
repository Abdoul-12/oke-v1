"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { validateEmail, validatePhone } from "@/lib/security/input"
import { formatFcfa, getOffrePaiement, type OffrePaiement } from "@/lib/business/offers"

type ModePaiement = "airtel" | "moov" | "carte"

interface ProjetPaiement {
  id: string
  titre: string
  secteur: string
  pays: string
}

const modes: Array<{
  id: ModePaiement
  label: string
  description: string
  couleur: string
}> = [
  {
    id: "airtel",
    label: "Airtel Money",
    description: "Paiement Mobile Money Gabon",
    couleur: "border-orange-500 bg-orange-50 text-orange-700",
  },
  {
    id: "moov",
    label: "Moov Money",
    description: "Paiement Mobile Money Afrique",
    couleur: "border-secondary bg-secondary/10 text-secondary",
  },
  {
    id: "carte",
    label: "Carte bancaire",
    description: "Visa / Mastercard via Stripe",
    couleur: "border-dark bg-dark text-white",
  },
]

function PaiementIcon({ mode }: { mode: ModePaiement }) {
  if (mode === "carte") {
    return (
      <span className="flex h-10 w-[74px] items-center justify-center rounded-lg bg-white text-[15px] font-black tracking-wide text-[#1A1F71] shadow-sm">
        VISA
      </span>
    )
  }

  if (mode === "moov") {
    return (
      <span className="flex h-12 w-[92px] items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 shadow-sm">
        <Image
          src="/payments/moov-money.jpg"
          alt="Moov Money"
          width={120}
          height={72}
          className="h-full w-full object-contain"
        />
      </span>
    )
  }

  return (
    <span className="flex h-12 w-[92px] items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 shadow-sm">
      <Image
        src="/payments/airtel-money.jpg"
        alt="Airtel Money"
        width={120}
        height={64}
        className="h-full w-full object-contain"
      />
    </span>
  )
}

const indicatifs = [
  { pays: "Gabon", code: "+241", exemple: "077 123 456" },
  { pays: "Cameroun", code: "+237", exemple: "6 00 00 00 00" },
  { pays: "Sénégal", code: "+221", exemple: "77 000 00 00" },
  { pays: "Côte d'Ivoire", code: "+225", exemple: "07 00 00 00 00" },
  { pays: "Bénin", code: "+229", exemple: "01 00 00 00 00" },
  { pays: "Togo", code: "+228", exemple: "90 00 00 00" },
  { pays: "Mali", code: "+223", exemple: "70 00 00 00" },
  { pays: "Burkina Faso", code: "+226", exemple: "70 00 00 00" },
  { pays: "Rwanda", code: "+250", exemple: "78 000 0000" },
  { pays: "Maroc", code: "+212", exemple: "06 00 00 00 00" },
]

export default function PaiementPage() {
  const router = useRouter()
  const [mode, setMode] = useState<ModePaiement>("airtel")
  const [message, setMessage] = useState("")
  const [chargement, setChargement] = useState(false)
  const [indicatif, setIndicatif] = useState("+241")
  const [projet, setProjet] = useState<ProjetPaiement | null>(null)
  const [chargementProjet, setChargementProjet] = useState(true)
  const [offrePaiement, setOffrePaiement] = useState<OffrePaiement>(getOffrePaiement("dossier"))
  const [reference, setReference] = useState<{ projetId?: string; offreId?: string }>({})

  const modeActif = modes.find((item) => item.id === mode) ?? modes[0]
  const indicatifActif = indicatifs.find((item) => item.code === indicatif) ?? indicatifs[0]

  useEffect(() => {
    async function chargerProjet() {
      const projetId = new URLSearchParams(window.location.search).get("projet")
      const offreId = new URLSearchParams(window.location.search).get("offre")
      const type = new URLSearchParams(window.location.search).get("type")
      const offre = getOffrePaiement(type)
      setOffrePaiement(offre)
      setReference({ projetId: projetId ?? undefined, offreId: offreId ?? undefined })

      if ((offre.type !== "dossier" && offre.type !== "boost_projet") || !projetId) {
        setChargementProjet(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("projets")
          .select("id, titre, secteur, pays")
          .eq("id", projetId)
          .single()

        if (error || !data) {
          setMessage("Projet introuvable. Retournez au catalogue.")
          return
        }

        setProjet({
          id: String(data.id),
          titre: String(data.titre),
          secteur: String(data.secteur),
          pays: String(data.pays),
        })
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Chargement du projet impossible.")
      } finally {
        setChargementProjet(false)
      }
    }

    chargerProjet()
  }, [])

  async function traiterPaiement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setChargement(true)

    try {
      if (offrePaiement.type === "dossier" && (!reference.projetId || !projet)) {
        setMessage("Projet introuvable. Retournez au catalogue.")
        return
      }

      if (offrePaiement.type === "boost_projet" && !reference.projetId) {
        setMessage("Sélectionnez un projet depuis votre dashboard avant d'activer le boost.")
        return
      }

      if (offrePaiement.type === "sponsor_offre" && !reference.offreId) {
        setMessage("Sélectionnez une offre depuis votre dashboard avant de la sponsoriser.")
        return
      }

      if (!modes.some((item) => item.id === mode)) {
        setMessage("Sélectionnez un mode de paiement valide.")
        return
      }

      const formData = new FormData(event.currentTarget)
      const contact = String(formData.get("contact") ?? "")
      const contactValide = mode === "carte" ? validateEmail(contact) : validatePhone(contact)

      if (!contactValide.ok) {
        setMessage(contactValide.message)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage("Connectez-vous pour finaliser ce paiement.")
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        setMessage("Session expirée. Reconnectez-vous pour continuer.")
        return
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: offrePaiement.type,
          projetId: reference.projetId ?? projet?.id,
          offreId: reference.offreId,
          mode,
          contact: contactValide.value,
        }),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { message?: string } | null
        setMessage(result?.message ?? "Paiement impossible pour le moment.")
        return
      }

      const result = (await response.json().catch(() => null)) as { redirectTo?: string } | null
      router.push(result?.redirectTo ?? offrePaiement.retour)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Paiement impossible pour le moment.")
    } finally {
      setChargement(false)
    }
  }

  return (
    <main className="bg-light">
      <section className="mx-auto grid w-full max-w-[1480px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[1fr_420px] lg:px-12 lg:py-12 2xl:px-20">
        <div>
          <Link href={projet ? `/projets/${projet.id}` : offrePaiement.retour} className="text-sm font-semibold text-muted transition-colors hover:text-primary">
            ← Retour
          </Link>

          <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {offrePaiement.type === "dossier" ? "🔒" : "↗"}
              </div>
              <h1 className="mt-5 text-[30px] font-bold leading-tight text-dark sm:text-[34px]">
                {offrePaiement.titre}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">
                {chargementProjet
                  ? "Chargement..."
                  : offrePaiement.type === "dossier" && projet
                    ? `Débloquez les informations stratégiques du projet ${projet.titre}.`
                    : offrePaiement.description}
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-light p-5">
              {offrePaiement.type === "dossier" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Projet sélectionné</p>
                    <p className="mt-1 text-base font-bold text-dark">{projet?.titre ?? "Projet introuvable"}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">{projet?.secteur ?? "Projet"}</span>
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-muted">{projet?.pays ?? "Pays"}</span>
                  </div>
                </div>
              )}

              {offrePaiement.type === "dossier" && <div className="mt-5 h-px bg-border" />}

              <p className={`${offrePaiement.type === "dossier" ? "mt-5" : ""} text-sm font-bold text-dark`}>
                Ce que vous débloquez :
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {offrePaiement.avantages.map((element) => (
                  <li key={element} className="flex gap-2 text-sm leading-5 text-muted">
                    <span className="text-primary">✓</span>
                    <span>{element}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border-t border-border pt-6 text-center">
              <p className="text-[28px] font-bold text-primary">{formatFcfa(offrePaiement.montant)}</p>
              <p className="mt-2 text-sm text-muted">Activation immédiate après confirmation du paiement</p>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-lg font-bold text-dark">Mode de paiement</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Choisissez un moyen de paiement pour finaliser l&apos;activation.
          </p>

          <form className="mt-6" onSubmit={traiterPaiement}>
            <div className="grid gap-3">
              {modes.map((item) => {
                const actif = item.id === mode

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMode(item.id)
                      setMessage("")
                    }}
                    className={`flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors ${
                      actif ? item.couleur : "border-border bg-white text-dark hover:border-primary"
                    }`}
                  >
                    <PaiementIcon mode={item.id} />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className={`mt-1 block text-xs ${actif && item.id === "carte" ? "text-slate-400" : "text-muted"}`}>
                        {item.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-5">
              <label htmlFor="telephone" className="mb-2 block text-sm font-semibold text-dark">
                {mode === "carte" ? "Email de confirmation" : "Numéro de téléphone"}
              </label>
              {mode === "carte" ? (
                <input
                  id="telephone"
                  name="contact"
                  type="email"
                  required
                  placeholder="investisseur@email.com"
                  className="h-12 w-full rounded-lg border border-border px-4 text-sm text-dark outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              ) : (
                <div className="flex h-12 overflow-hidden rounded-lg border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <label htmlFor="indicatif" className="sr-only">
                    Indicatif téléphonique
                  </label>
                  <div className="relative border-r border-border bg-light">
                    <select
                      id="indicatif"
                      value={indicatif}
                      onChange={(event) => setIndicatif(event.target.value)}
                      aria-label="Choisir l'indicatif téléphonique"
                      className="h-full min-w-[96px] appearance-none bg-transparent py-0 pl-4 pr-8 text-sm font-semibold text-dark outline-none"
                    >
                      {indicatifs.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                      ▾
                    </span>
                  </div>
                  <input
                    id="telephone"
                    name="contact"
                    required
                    placeholder={indicatifActif.exemple}
                    className="min-w-0 flex-1 px-4 text-sm text-dark outline-none placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {message && (
              <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-5 text-primary">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
            >
              {chargement ? "Traitement en cours..." : `Payer avec ${modeActif.label}`}
            </button>

            <p className="mt-4 text-center text-xs text-muted">Transactions chiffrées SSL 256-bit</p>
          </form>
        </aside>
      </section>
    </main>
  )
}
