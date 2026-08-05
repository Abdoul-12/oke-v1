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

async function ensureBucket(name: string, options: { public: boolean; fileSizeLimit: number; allowedMimeTypes: string[] }) {
  const admin = createAdminClient()
  const existing = await admin.storage.getBucket(name)

  if (!existing.error) {
    return
  }

  const created = await admin.storage.createBucket(name, {
    public: options.public,
    fileSizeLimit: options.fileSizeLimit,
    allowedMimeTypes: options.allowedMimeTypes,
  })

  if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
    throw created.error
  }
}

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 30, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return jsonError("Trop de soumissions. Réessayez dans quelques instants.", 429)
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")

  if (!token) {
    return jsonError("Session manquante.", 401)
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

  if (!isRoleUtilisateur(profile?.role) || profile.role !== "developpeur") {
    return jsonError("Seul un compte développeur peut publier un projet.", 403)
  }

  const formData = await request.formData()
  const titre = validateSafeText("Le titre du projet", String(formData.get("titre") ?? ""), 3, 90)
  const secteur = validateSafeText("Le secteur", String(formData.get("secteur") ?? ""), 3, 40)
  const pays = validateSafeText("Le pays", String(formData.get("pays") ?? ""), 2, 60)
  const budget = validatePositiveAmount(String(formData.get("budget") ?? ""), "Le budget")
  const description = validateSafeText("La description", String(formData.get("description") ?? ""), 20, 600)
  const probleme = sanitizeText(formData.get("probleme"), 800)
  const solution = sanitizeText(formData.get("solution"), 800)
  const image = formData.get("image")
  const dossier = formData.get("dossier")

  for (const result of [titre, secteur, pays, budget, description]) {
    if (!result.ok) {
      return jsonError(result.message)
    }
  }

  let imageUrl: string | null = null
  let dossierUrl: string | null = null

  if (image instanceof File && image.size > 0) {
    await ensureBucket("project-images", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    })

    const extension = image.name.split(".").pop() ?? "jpg"
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`
    const uploaded = await admin.storage.from("project-images").upload(path, image, {
      contentType: image.type,
      upsert: false,
    })

    if (uploaded.error) {
      return jsonError(uploaded.error.message)
    }

    imageUrl = admin.storage.from("project-images").getPublicUrl(path).data.publicUrl
  }

  if (dossier instanceof File && dossier.size > 0) {
    await ensureBucket("project-documents", {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["application/pdf"],
    })

    const path = `${user.id}/${crypto.randomUUID()}.pdf`
    const uploaded = await admin.storage.from("project-documents").upload(path, dossier, {
      contentType: dossier.type || "application/pdf",
      upsert: false,
    })

    if (uploaded.error) {
      return jsonError(uploaded.error.message)
    }

    dossierUrl = path
  }

  const projetComplet = {
    developpeur_id: user.id,
    titre: titre.value,
    description: description.value,
    probleme,
    solution,
    secteur: secteur.value,
    pays: pays.value,
    budget_cible: budget.value,
    statut: "actif",
    image_url: imageUrl,
    dossier_url: dossierUrl,
    score: 70,
  }

  const inserted = await admin.from("projets").insert(projetComplet)

  if (inserted.error) {
    const message = inserted.error.message.toLowerCase()

    if (message.includes("schema cache") || message.includes("column") || message.includes("does not exist")) {
      const insertedMinimal = await admin.from("projets").insert({
        developpeur_id: user.id,
        titre: titre.value,
        description: description.value,
        secteur: secteur.value,
        pays: pays.value,
        budget_cible: budget.value,
        statut: "actif",
        score: 70,
      })

      if (!insertedMinimal.error) {
        return NextResponse.json({
          message: "Projet publié avec succès. Ajoutez les colonnes projet avancées dans Supabase pour activer image, dossier, problème et solution.",
        })
      }

      return jsonError(insertedMinimal.error.message)
    }

    return jsonError(inserted.error.message)
  }

  return NextResponse.json({ message: "Projet publié avec succès." })
}
