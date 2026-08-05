"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { validateEmail } from "@/lib/security/input"

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [erreur, setErreur] = useState("")
  const [chargement, setChargement] = useState(false)

  async function demanderReinitialisation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur("")
    setMessage("")

    const emailValide = validateEmail(email)

    if (!emailValide.ok) {
      setErreur(emailValide.message)
      return
    }

    setChargement(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(emailValide.value, {
        redirectTo: `${window.location.origin}/connexion`,
      })

      if (error) {
        setErreur("La demande n'a pas pu être envoyée. Réessayez dans un instant.")
        return
      }

      setMessage("Si cette adresse existe sur OkeTech, un email de réinitialisation vient d'être envoyé.")
    } catch {
      setErreur("Service momentanément indisponible. Réessayez dans un instant.")
    } finally {
      setChargement(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-light px-6 py-10">
      <section className="w-full max-w-[430px] rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-8 inline-flex items-center gap-2" aria-label="Accueil OkeTech">
          <span className="flex h-9 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            OKE
          </span>
          <span className="text-xl font-bold text-dark">Tech</span>
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Sécurité du compte</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-dark sm:text-[28px]">
            Réinitialiser le mot de passe
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            Entrez l&apos;email utilisé à l&apos;inscription. Supabase enverra un lien sécurisé pour créer un nouveau mot de passe.
          </p>
        </div>

        <form className="mt-7 space-y-5" onSubmit={demanderReinitialisation}>
          {erreur && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
              {erreur}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm leading-5 text-primary">
              {message}
            </p>
          )}

          <label htmlFor="email" className="block">
            <span className="text-sm font-semibold text-dark">Adresse email</span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="exemple@email.com"
              className="mt-2 h-[52px] w-full rounded-lg border border-border bg-white px-4 text-[15px] text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <button
            type="submit"
            disabled={chargement}
            className="flex h-[52px] w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:bg-primary/70"
          >
            {chargement ? "Envoi en cours..." : "Envoyer le lien sécurisé →"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Vous connaissez votre mot de passe ?{" "}
          <Link href="/connexion" className="font-semibold text-primary hover:text-primary/80">
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  )
}
