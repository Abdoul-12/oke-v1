import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSupabaseBrowserEnv } from "@/lib/supabase/config"
import { sanitizeText, validateSafeText } from "@/lib/security/input"
import { rateLimit } from "@/lib/security/rate-limit"

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

function colonneMessageManquante(message: string) {
  return message.includes("edited_at") || message.includes("deleted_at")
}

async function getUserFromRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")

  if (!token) {
    return null
  }

  const { url, anonKey } = getSupabaseBrowserEnv()
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const {
    data: { user },
  } = await authClient.auth.getUser(token)

  return user
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)

  if (!user) {
    return jsonError("Session invalide.", 401)
  }

  const admin = createAdminClient()
  const destinataireDemande = sanitizeText(request.nextUrl.searchParams.get("destinataire"), 80)
  const [profileConnecte, profiles, messagesResult] = await Promise.all([
    admin.from("profiles").select("role").eq("id", user.id).single(),
    admin.from("profiles").select("id, nom, prenom, role").neq("id", user.id).order("created_at", { ascending: false }).limit(20),
    admin
      .from("messages")
      .select("id, expediteur, destinataire, contenu, lu, created_at, edited_at, deleted_at")
      .or(`expediteur.eq.${user.id},destinataire.eq.${user.id}`)
      .order("created_at", { ascending: true })
      .limit(100),
  ])

  if (profileConnecte.error) {
    return jsonError(profileConnecte.error.message)
  }

  if (profiles.error) {
    return jsonError(profiles.error.message)
  }

  let messages = messagesResult as {
    data: Array<Record<string, unknown>> | null
    error: { message: string } | null
  }

  if (messages.error && colonneMessageManquante(messages.error.message)) {
    messages = await admin
      .from("messages")
      .select("id, expediteur, destinataire, contenu, lu, created_at")
      .or(`expediteur.eq.${user.id},destinataire.eq.${user.id}`)
      .order("created_at", { ascending: true })
      .limit(100)
  }

  if (messages.error) {
    return jsonError(messages.error.message)
  }

  let profilesData = profiles.data ?? []

  if (destinataireDemande && !profilesData.some((profile) => profile.id === destinataireDemande)) {
    const { data: profileDemande } = await admin
      .from("profiles")
      .select("id, nom, prenom, role")
      .eq("id", destinataireDemande)
      .neq("id", user.id)
      .maybeSingle()

    if (profileDemande) {
      profilesData = [profileDemande, ...profilesData]
    }
  }

  return NextResponse.json({
    userId: user.id,
    role: profileConnecte.data?.role ?? null,
    profiles: profilesData,
    messages: messages.data,
  })
}

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 60, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return jsonError("Trop de messages envoyés. Réessayez dans quelques instants.", 429)
  }

  const user = await getUserFromRequest(request)

  if (!user) {
    return jsonError("Session invalide.", 401)
  }

  const body = (await request.json().catch(() => null)) as { destinataire?: string; contenu?: string } | null
  const destinataire = sanitizeText(body?.destinataire, 80)
  const contenu = validateSafeText("Le message", String(body?.contenu ?? ""), 1, 2000)

  if (!destinataire) {
    return jsonError("Sélectionnez un destinataire.")
  }

  if (!contenu.ok) {
    return jsonError(contenu.message)
  }

  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("id").eq("id", destinataire).single()

  if (!profile) {
    return jsonError("Destinataire introuvable.", 404)
  }

  const { error } = await admin.from("messages").insert({
    expediteur: user.id,
    destinataire,
    contenu: contenu.value,
  })

  if (error) {
    return jsonError(error.message)
  }

  return NextResponse.json({ message: "Message envoyé." })
}

export async function PATCH(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 30, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return jsonError("Trop de modifications. Réessayez dans quelques instants.", 429)
  }

  const user = await getUserFromRequest(request)

  if (!user) {
    return jsonError("Session invalide.", 401)
  }

  const body = (await request.json().catch(() => null)) as { id?: string; contenu?: string } | null
  const id = sanitizeText(body?.id, 80)
  const contenu = validateSafeText("Le message", String(body?.contenu ?? ""), 1, 2000)

  if (!id) {
    return jsonError("Message introuvable.")
  }

  if (!contenu.ok) {
    return jsonError(contenu.message)
  }

  const admin = createAdminClient()
  const { data: message } = await admin
    .from("messages")
    .select("id, expediteur")
    .eq("id", id)
    .eq("expediteur", user.id)
    .maybeSingle()

  if (!message) {
    return jsonError("Vous ne pouvez modifier que vos propres messages.", 403)
  }

  let update = await admin
    .from("messages")
    .update({ contenu: contenu.value, edited_at: new Date().toISOString() })
    .eq("id", id)
    .eq("expediteur", user.id)

  if (update.error && colonneMessageManquante(update.error.message)) {
    update = await admin
      .from("messages")
      .update({ contenu: `${contenu.value} (modifié)` })
      .eq("id", id)
      .eq("expediteur", user.id)
  }

  if (update.error) {
    return jsonError(update.error.message)
  }

  return NextResponse.json({ message: "Message modifié." })
}

export async function DELETE(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 30, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return jsonError("Trop de suppressions. Réessayez dans quelques instants.", 429)
  }

  const user = await getUserFromRequest(request)

  if (!user) {
    return jsonError("Session invalide.", 401)
  }

  const id = sanitizeText(request.nextUrl.searchParams.get("id"), 80)

  if (!id) {
    return jsonError("Message introuvable.")
  }

  const admin = createAdminClient()
  const { data: message } = await admin
    .from("messages")
    .select("id, expediteur")
    .eq("id", id)
    .eq("expediteur", user.id)
    .maybeSingle()

  if (!message) {
    return jsonError("Vous ne pouvez supprimer que vos propres messages.", 403)
  }

  let update = await admin
    .from("messages")
    .update({ contenu: "Ce message a été supprimé.", deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("expediteur", user.id)

  if (update.error && colonneMessageManquante(update.error.message)) {
    update = await admin
      .from("messages")
      .update({ contenu: "Ce message a été supprimé." })
      .eq("id", id)
      .eq("expediteur", user.id)
  }

  if (update.error) {
    return jsonError(update.error.message)
  }

  return NextResponse.json({ message: "Message supprimé." })
}
