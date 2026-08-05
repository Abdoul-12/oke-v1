"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { dashboardParRole, isRoleUtilisateur, type RoleUtilisateur } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/config"

interface PublicAuthLinkProps {
  className: string
  visiteurHref?: string
  visiteurLabel: string
  connecteLabel?: string
}

export default function PublicAuthLink({
  className,
  visiteurHref = "/inscription",
  visiteurLabel,
  connecteLabel = "Accéder à mon espace",
}: PublicAuthLinkProps) {
  const [role, setRole] = useState<RoleUtilisateur | null>(null)
  const [charge, setCharge] = useState(false)

  useEffect(() => {
    let actif = true

    async function chargerSession() {
      try {
        if (!isSupabaseConfigured()) {
          if (actif) setCharge(true)
          return
        }

        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!actif) return

        if (!user) {
          setCharge(true)
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        setRole(isRoleUtilisateur(profile?.role) ? profile.role : null)
        setCharge(true)
      } catch {
        if (actif) {
          setRole(null)
          setCharge(true)
        }
      }
    }

    void chargerSession()

    return () => {
      actif = false
    }
  }, [])

  if (!charge) {
    return (
      <span className={className} aria-hidden="true">
        {visiteurLabel}
      </span>
    )
  }

  return (
    <Link href={role ? dashboardParRole(role) : visiteurHref} className={className}>
      {role ? connecteLabel : visiteurLabel}
    </Link>
  )
}
