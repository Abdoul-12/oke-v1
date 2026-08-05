import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSupabaseBrowserEnv } from "@/lib/supabase/config"
import { sanitizeText, validatePositiveAmount, validateSafeText } from "@/lib/security/input"
import { rateLimit } from "@/lib/security/rate-limit"
import { isRoleUtilisateur } from "@/lib/auth/roles"

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

async function getUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) return null

  const { url, anonKey } = getSupabaseBrowserEnv()
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const {
    data: { user },
  } = await authClient.auth.getUser(token)

  return user
}

export async function GET(request: NextRequest) {
  const user = await getUser(request)

  if (!user) {
    return jsonError("Session invalide.", 401)
  }

  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()

  if (!isRoleUtilisateur(profile?.role) || profile.role !== "entreprise") {
    return jsonError("Seul un compte entreprise peut consulter ses offres.", 403)
  }

  const { data, error } = await admin
    .from("offres")
    .select("id, titre, description, type_contrat, technologies, localisation, salaire_min, salaire_max, statut, created_at")
    .eq("entreprise_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return jsonError(error.message)
  }

  return NextResponse.json({ offres: data })
}

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 30, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return jsonError("Trop de publications. Réessayez dans quelques instants.", 429)
  }

  const user = await getUser(request)

  if (!user) {
    return jsonError("Session invalide.", 401)
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const titre = validateSafeText("Le titre de l'offre", String(body?.titre ?? ""), 3, 120)
  const description = validateSafeText("La description", String(body?.description ?? ""), 20, 2000)
  const typeContrat = sanitizeText(String(body?.type_contrat ?? ""), 40)
  const localisation = sanitizeText(String(body?.localisation ?? ""), 120)
  const salaireMin = body?.salaire_min ? validatePositiveAmount(String(body.salaire_min), "Le salaire minimum") : null
  const salaireMax = body?.salaire_max ? validatePositiveAmount(String(body.salaire_max), "Le salaire maximum") : null
  const technologies = sanitizeText(String(body?.technologies ?? ""), 200)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)

  for (const result of [titre, description]) {
    if (!result.ok) return jsonError(result.message)
  }

  if (salaireMin && !salaireMin.ok) return jsonError(salaireMin.message)
  if (salaireMax && !salaireMax.ok) return jsonError(salaireMax.message)

  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()

  if (!isRoleUtilisateur(profile?.role) || profile.role !== "entreprise") {
    return jsonError("Seul un compte entreprise peut publier une offre.", 403)
  }

  const { error } = await admin.from("offres").insert({
    entreprise_id: user.id,
    titre: titre.value,
    description: description.value,
    type_contrat: typeContrat || null,
    technologies,
    localisation: localisation || null,
    salaire_min: salaireMin?.ok ? salaireMin.value : null,
    salaire_max: salaireMax?.ok ? salaireMax.value : null,
    statut: "active",
  })

  if (error) {
    return jsonError(error.message)
  }

  return NextResponse.json({ message: "Offre publiée avec succès." })
}
