"use client"

import Link from "next/link"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { dashboardParRole, isRoleUtilisateur, type RoleUtilisateur } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/client"
import { sanitizeSearch } from "@/lib/security/input"

interface ProfileItem {
  id: string
  nom: string
  prenom: string | null
  role: string
}

interface MessageItem {
  id: string
  expediteur: string
  destinataire: string
  contenu: string
  created_at: string
  edited_at?: string | null
  deleted_at?: string | null
}

function nomProfil(profile: ProfileItem) {
  return `${profile.prenom ?? ""} ${profile.nom}`.trim() || "Utilisateur OkeTech"
}

export default function MessageriePage() {
  const searchParams = useSearchParams()
  const destinataireInitial = searchParams.get("destinataire") ?? ""
  const [userId, setUserId] = useState("")
  const [profiles, setProfiles] = useState<ProfileItem[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [destinataire, setDestinataire] = useState("")
  const [recherche, setRecherche] = useState("")
  const [contenu, setContenu] = useState("")
  const [messageEnEdition, setMessageEnEdition] = useState<MessageItem | null>(null)
  const [message, setMessage] = useState("")
  const [chargement, setChargement] = useState(true)
  const [roleConnecte, setRoleConnecte] = useState<RoleUtilisateur | null>(null)

  const chargerMessages = useCallback(async function chargerMessages() {
    setChargement(true)
    setMessage("")

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        setMessage("Connectez-vous pour accéder à la messagerie.")
        return
      }

      const query = destinataireInitial ? `?destinataire=${encodeURIComponent(destinataireInitial)}` : ""
      const response = await fetch(`/api/messages${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = (await response.json()) as {
        userId?: string
        role?: string | null
        profiles?: ProfileItem[]
        messages?: MessageItem[]
        message?: string
      }

      if (!response.ok) {
        setMessage(result.message ?? "Chargement impossible.")
        return
      }

      setUserId(result.userId ?? "")
      setRoleConnecte(isRoleUtilisateur(result.role) ? result.role : null)
      setProfiles(result.profiles ?? [])
      setMessages(result.messages ?? [])
      setDestinataire((actuel) => {
        if (actuel) return actuel
        if (destinataireInitial && result.profiles?.some((profile) => profile.id === destinataireInitial)) {
          return destinataireInitial
        }
        return result.profiles?.[0]?.id || ""
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.")
    } finally {
      setChargement(false)
    }
  }, [destinataireInitial])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void chargerMessages()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [chargerMessages])

  const profilesFiltres = useMemo(() => {
    const texte = recherche.toLowerCase()
    return profiles.filter((profile) => nomProfil(profile).toLowerCase().includes(texte) || profile.role.includes(texte))
  }, [profiles, recherche])

  const conversation = messages.filter(
    (item) =>
      (item.expediteur === userId && item.destinataire === destinataire) ||
      (item.destinataire === userId && item.expediteur === destinataire),
  )

  const profileActif = profiles.find((profile) => profile.id === destinataire)

  async function envoyerMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    if (!destinataire || !contenu.trim()) {
      setMessage("Sélectionnez un destinataire et écrivez un message.")
      return
    }

    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      setMessage("Session expirée. Reconnectez-vous.")
      return
    }

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ destinataire, contenu }),
    })

    const result = (await response.json().catch(() => null)) as { message?: string } | null

    if (!response.ok) {
      setMessage(result?.message ?? "Envoi impossible.")
      return
    }

    setContenu("")
    setMessageEnEdition(null)
    await chargerMessages()
  }

  async function modifierMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    if (!messageEnEdition || !contenu.trim()) {
      setMessage("Sélectionnez un message à modifier.")
      return
    }

    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      setMessage("Session expirée. Reconnectez-vous.")
      return
    }

    const response = await fetch("/api/messages", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: messageEnEdition.id, contenu }),
    })

    const result = (await response.json().catch(() => null)) as { message?: string } | null

    if (!response.ok) {
      setMessage(result?.message ?? "Modification impossible.")
      return
    }

    setContenu("")
    setMessageEnEdition(null)
    await chargerMessages()
  }

  async function supprimerMessage(id: string) {
    setMessage("")

    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      setMessage("Session expirée. Reconnectez-vous.")
      return
    }

    const response = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    const result = (await response.json().catch(() => null)) as { message?: string } | null

    if (!response.ok) {
      setMessage(result?.message ?? "Suppression impossible.")
      return
    }

    if (messageEnEdition?.id === id) {
      setMessageEnEdition(null)
      setContenu("")
    }

    await chargerMessages()
  }

  function lancerEdition(item: MessageItem) {
    setMessageEnEdition(item)
    setContenu(item.contenu)
  }

  return (
    <main className="bg-light">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-border bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-[68px] items-center justify-between px-5">
            <h1 className="text-sm font-bold text-dark">Messages</h1>
            <button type="button" onClick={chargerMessages} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-sm text-dark hover:border-primary hover:text-primary">
              ↻
            </button>
          </div>

          <div className="border-y border-border bg-light px-3 py-3">
            <label htmlFor="recherche-message" className="sr-only">Rechercher une conversation</label>
            <input
              id="recherche-message"
              value={recherche}
              onChange={(event) => setRecherche(sanitizeSearch(event.target.value))}
              placeholder="Rechercher..."
              className="h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-dark outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="max-h-[320px] divide-y divide-border overflow-y-auto lg:max-h-none">
            {profilesFiltres.map((profile) => {
              const actif = profile.id === destinataire
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setDestinataire(profile.id)}
                  className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors ${actif ? "bg-primary/5" : "bg-white hover:bg-light"}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {nomProfil(profile).slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="truncate text-sm font-bold text-dark">{nomProfil(profile)}</span>
                    <span className="mt-1 block truncate text-xs capitalize text-muted">{profile.role}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="flex min-h-[70dvh] flex-col lg:min-h-[calc(100vh-72px)]">
          <header className="flex min-h-[68px] flex-col gap-3 border-b border-border bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                {profileActif ? nomProfil(profileActif).slice(0, 2).toUpperCase() : "OK"}
              </span>
              <div>
                <h2 className="text-sm font-bold text-dark">{profileActif ? nomProfil(profileActif) : "Messagerie OkeTech"}</h2>
                <p className="mt-1 text-xs font-semibold capitalize text-primary">{profileActif?.role ?? "Sélectionnez une conversation"}</p>
              </div>
            </div>

            {roleConnecte && (
              <Link
                href={dashboardParRole(roleConnecte)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
              >
                Retour à ma dashboard
              </Link>
            )}
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto w-full max-w-[1120px]">
            {message && <p className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">{message}</p>}
            {chargement ? (
              <p className="text-sm text-muted">Chargement...</p>
            ) : conversation.length === 0 ? (
              <p className="rounded-xl border border-border bg-white p-6 text-sm text-muted">Aucun message dans cette conversation.</p>
            ) : (
              <div className="space-y-4">
                {conversation.map((item) => {
                  const moi = item.expediteur === userId
                  const supprime = Boolean(item.deleted_at) || item.contenu === "Ce message a été supprimé."
                  return (
                    <div key={item.id} className={`flex ${moi ? "justify-end" : "justify-start"}`}>
                      <div className="group max-w-[min(620px,85vw)]">
                        <div className={`rounded-xl px-4 py-3 text-sm leading-6 ${moi ? "bg-primary text-white" : "border border-border bg-white text-dark"} ${supprime ? "bg-slate-100 text-muted" : ""}`}>
                          <p className={supprime ? "italic" : ""}>{item.contenu}</p>
                          <p className={`mt-2 text-right text-xs ${moi && !supprime ? "text-white/80" : "text-muted"}`}>
                            {item.edited_at && !supprime ? "Modifié · " : ""}
                            {new Date(item.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {moi && !supprime && (
                          <div className="mt-2 flex justify-end gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => lancerEdition(item)}
                              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted shadow-sm transition-colors hover:border-primary hover:text-primary"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => void supprimerMessage(item.id)}
                              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            </div>
          </div>

          <footer className="border-t border-border bg-white px-4 py-4">
            <form className="mx-auto flex w-full max-w-[1120px] flex-col gap-3 sm:flex-row" onSubmit={messageEnEdition ? modifierMessage : envoyerMessage}>
              <label htmlFor="message" className="sr-only">Message</label>
              <input
                id="message"
                value={contenu}
                onChange={(event) => setContenu(event.target.value)}
                placeholder={messageEnEdition ? "Modifiez votre message..." : "Écrivez votre message ici..."}
                className="h-11 min-w-0 flex-1 rounded-lg border border-border px-4 text-sm text-dark outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {messageEnEdition && (
                <button
                  type="button"
                  onClick={() => {
                    setMessageEnEdition(null)
                    setContenu("")
                  }}
                  className="h-11 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  Annuler
                </button>
              )}
              <button type="submit" className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 sm:w-12">
                {messageEnEdition ? "✓" : "➤"}
              </button>
            </form>
          </footer>
        </section>
      </div>
    </main>
  )
}
