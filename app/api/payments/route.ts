import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSupabaseBrowserEnv } from "@/lib/supabase/config"
import { validateEmail, validatePhone } from "@/lib/security/input"
import { rateLimit } from "@/lib/security/rate-limit"
import { getOffrePaiement, offresPaiement, type OffrePaiementType } from "@/lib/business/offers"
import { isRoleUtilisateur, rolePaiement } from "@/lib/auth/roles"

const modes = ["airtel", "moov", "carte"] as const
const typesPaiement = Object.keys(offresPaiement) as OffrePaiementType[]

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

function tableTransactionsManquante(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? ""
  return error.code === "42P01" || error.code === "PGRST205" || message.includes("transactions_revenus")
}

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 30, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return jsonError("Trop de tentatives de paiement. Réessayez dans quelques instants.", 429)
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")

  if (!token) {
    return jsonError("Session manquante.", 401)
  }

  const body = (await request.json().catch(() => null)) as {
    projetId?: string
    offreId?: string
    type?: string
    mode?: string
    contact?: string
  } | null

  if (!body?.mode || !body.contact) {
    return jsonError("Données de paiement incomplètes.")
  }

  const type = typesPaiement.includes(body.type as OffrePaiementType) ? body.type as OffrePaiementType : "dossier"
  const offrePaiement = getOffrePaiement(type)

  if (type === "dossier" && !body.projetId) {
    return jsonError("Projet manquant pour l'accès dossier.")
  }

  if (type === "boost_projet" && !body.projetId) {
    return jsonError("Projet manquant pour le boost.")
  }

  if (type === "sponsor_offre" && !body.offreId) {
    return jsonError("Offre manquante pour la sponsorisation.")
  }

  if (!modes.includes(body.mode as (typeof modes)[number])) {
    return jsonError("Mode de paiement invalide.")
  }

  const contact = body.mode === "carte" ? validateEmail(body.contact) : validatePhone(body.contact)

  if (!contact.ok) {
    return jsonError(contact.message)
  }

  const { url, anonKey } = getSupabaseBrowserEnv()
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token)

  if (userError || !user) {
    return jsonError("Session invalide.", 401)
  }

  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
  const roleAttendu = rolePaiement(type)

  if (!isRoleUtilisateur(profile?.role) || profile.role !== roleAttendu) {
    return jsonError("Votre profil ne permet pas d'effectuer ce paiement.", 403)
  }

  let referenceId: string | null = null

  if (type === "dossier") {
    const { data: projet, error: projetError } = await admin
      .from("projets")
      .select("id")
      .eq("id", body.projetId)
      .single()

    if (projetError || !projet) {
      return jsonError("Projet introuvable.", 404)
    }

    referenceId = projet.id

    const { error } = await admin.from("acces_dossiers").upsert(
      {
        investisseur_id: user.id,
        projet_id: projet.id,
        montant: offrePaiement.montant,
        mode_paiement: body.mode,
        statut: "confirme",
      },
      { onConflict: "investisseur_id,projet_id" },
    )

    if (error) {
      return jsonError(error.message)
    }
  }

  if (type === "boost_projet") {
    const projetId = body.projetId as string
    const { data: projet, error } = await admin
      .from("projets")
      .update({ sponsored: true })
      .eq("id", projetId)
      .eq("developpeur_id", user.id)
      .select("id")
      .maybeSingle()

    if (error) {
      return jsonError(error.message)
    }

    if (!projet) {
      return jsonError("Projet introuvable ou non autorisé.", 404)
    }

    referenceId = projetId
  }

  if (type === "sponsor_offre") {
    const offreId = body.offreId as string
    const { data: offre, error } = await admin
      .from("offres")
      .update({ sponsored: true })
      .eq("id", offreId)
      .eq("entreprise_id", user.id)
      .select("id")
      .maybeSingle()

    if (error) {
      return jsonError(error.message)
    }

    if (!offre) {
      return jsonError("Offre introuvable ou non autorisée.", 404)
    }

    referenceId = offreId
  }

  const transaction = await admin.from("transactions_revenus").insert({
    user_id: user.id,
    type,
    reference_id: referenceId,
    montant: offrePaiement.montant,
    mode_paiement: body.mode,
    statut: "confirme",
  })

  if (transaction.error && !tableTransactionsManquante(transaction.error)) {
    return jsonError(transaction.error.message)
  }

  return NextResponse.json({
    message: type === "dossier" ? "Accès dossier confirmé." : "Paiement confirmé.",
    type,
    referenceId,
    redirectTo: type === "dossier" && referenceId ? `/projets/${referenceId}?acces=confirme` : offrePaiement.retour,
  })
}
