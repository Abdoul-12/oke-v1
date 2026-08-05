"use client"

import { ChangeEvent, useRef, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface DashboardIdentityProps {
  nom: string
  sousTitre: string
  avatarUrl?: string | null
  initiales?: string
  variant?: "dark" | "light"
  onAvatarUpdated: (url: string) => void
}

export default function DashboardIdentity({
  nom,
  sousTitre,
  avatarUrl,
  initiales = "OK",
  variant = "dark",
  onAvatarUpdated,
}: DashboardIdentityProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [chargement, setChargement] = useState(false)
  const [message, setMessage] = useState("")

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
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white ring-1 ring-white/15 transition hover:ring-primary"
          aria-label="Changer l'image du profil"
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill sizes="48px" unoptimized className="object-cover" />
          ) : (
            <span>{initiales}</span>
          )}
          <span className="absolute inset-0 hidden items-center justify-center bg-dark/60 text-[10px] font-semibold text-white group-hover:flex">
            Modifier
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={changerAvatar}
        />

        <div className="min-w-0">
          <p className={`truncate text-sm font-bold ${variant === "light" ? "text-dark" : "text-white"}`}>{nom}</p>
          <p className={`text-xs ${variant === "light" ? "text-muted" : "text-slate-400"}`}>{sousTitre}</p>
        </div>
      </div>

      {(chargement || message) && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-xs leading-5 ${variant === "light" ? "bg-primary/10 text-primary" : "bg-white/10 text-slate-200"}`}>
          {chargement ? "Import en cours..." : message}
        </p>
      )}
    </div>
  )
}
