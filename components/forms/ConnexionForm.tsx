"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { sanitizeText, validateEmail, validatePassword } from "@/lib/security/input"

function EyeIcon({ ouvert }: { ouvert: boolean }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      {ouvert ? (
        <>
          <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10.58 10.58A2 2 0 0 0 13.42 13.4M9.14 5.17A9.84 9.84 0 0 1 12 4.75c5.5 0 8.5 5.25 8.5 5.25a14.1 14.1 0 0 1-2.1 2.78M6.1 6.64C4.4 7.83 3.5 10 3.5 10s3 5.25 8.5 5.25c1.21 0 2.29-.25 3.24-.66" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M3.5 12s3-5.25 8.5-5.25 8.5 5.25 8.5 5.25-3 5.25-8.5 5.25S3.5 12 3.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 14.25A2.25 2.25 0 1 0 12 9.75a2.25 2.25 0 0 0 0 4.5Z" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
    </svg>
  )
}

export default function ConnexionForm() {
  const router = useRouter()
  const [identifiant, setIdentifiant] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)
  const [messageErreur, setMessageErreur] = useState("")
  const [chargement, setChargement] = useState(false)

  async function gererConnexion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessageErreur("")

    const email = validateEmail(identifiant)
    const password = validatePassword(motDePasse)

    if (!identifiant.trim() || !motDePasse.trim()) {
      setMessageErreur("Renseignez votre email ou téléphone et votre mot de passe.")
      return
    }

    if (!email.ok) {
      setMessageErreur("Entrez l'email utilisé à l'inscription.")
      return
    }

    if (!password.ok) {
      setMessageErreur(password.message)
      return
    }

    setChargement(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })

      if (error) {
        const message = error.message.toLowerCase()

        if (message.includes("email not confirmed") || message.includes("confirm")) {
          setMessageErreur("Votre compte existe, mais l'email n'est pas encore confirmé dans Supabase.")
          return
        }

        setMessageErreur("Identifiants incorrects. Vérifiez votre email et votre mot de passe.")
        return
      }

      if (!data.user) {
        setMessageErreur("Connexion impossible pour le moment.")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      const role = profile?.role
      const redirect = sanitizeText(new URLSearchParams(window.location.search).get("redirect"), 120)

      if (redirect.startsWith("/") && !redirect.startsWith("//")) {
        router.push(redirect)
        router.refresh()
        return
      }

      if (role === "developpeur" || role === "investisseur" || role === "entreprise") {
        router.push(`/dashboard/${role}`)
      } else {
        router.push("/")
      }

      router.refresh()
    } catch (error) {
      setMessageErreur(error instanceof Error ? error.message : "Connexion impossible pour le moment.")
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="w-full max-w-[410px]">
      <div className="text-center">
        <Link href="/" className="mx-auto mb-7 inline-flex items-center gap-2" aria-label="Accueil OkeTech">
          <span className="flex h-9 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            OKE
          </span>
          <span className="text-xl font-bold text-dark">Tech</span>
        </Link>

        <h1 className="text-[29px] font-bold leading-tight text-dark sm:text-[32px]">
          Bon retour parmi nous
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted sm:text-base">
          Connectez-vous à votre espace OkeTech.
        </p>
      </div>

      <div className="mt-8">
        {messageErreur && (
          <p
            id="connexion-erreur"
            role="alert"
            className="mb-5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-5 text-primary"
          >
            {messageErreur}
          </p>
        )}

        <form className="space-y-[18px]" onSubmit={gererConnexion}>
          <div>
            <label htmlFor="identifiant" className="sr-only">
              Email ou numéro de téléphone
            </label>
            <input
              id="identifiant"
              name="identifiant"
              type="text"
              autoComplete="email"
              placeholder="Email ou numéro de téléphone"
              value={identifiant}
              onChange={(event) => setIdentifiant(event.target.value)}
              aria-describedby={messageErreur ? "connexion-erreur" : undefined}
              className="h-[52px] w-full rounded-lg border border-border bg-white px-4 text-[15px] text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label htmlFor="mot-de-passe" className="sr-only">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="mot-de-passe"
                name="motDePasse"
                type={motDePasseVisible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Mot de passe"
                value={motDePasse}
                onChange={(event) => setMotDePasse(event.target.value)}
                aria-describedby={messageErreur ? "connexion-erreur" : undefined}
                className="h-[52px] w-full rounded-lg border border-border bg-white px-4 pr-12 text-[15px] text-dark outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                type="button"
                aria-label={motDePasseVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setMotDePasseVisible((visible) => !visible)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <EyeIcon ouvert={motDePasseVisible} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <label htmlFor="souvenir" className="flex items-center gap-2 text-muted">
              <input
                id="souvenir"
                name="souvenir"
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border text-primary accent-primary"
              />
              Se souvenir de moi
            </label>
            <Link
              href="/mot-de-passe-oublie"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="flex h-[52px] w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {chargement ? "Connexion..." : "Se connecter →"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm leading-6 text-muted">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-muted transition-colors hover:text-primary">
            Inscrivez-vous gratuitement
          </Link>
        </p>
      </div>
    </div>
  )
}
