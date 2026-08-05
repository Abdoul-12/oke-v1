import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { rateLimit } from "@/lib/security/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSupabaseBrowserEnv } from "@/lib/supabase/config"

const formatsAutorises = ["image/png", "image/jpeg", "image/webp"]
const tailleMax = 3 * 1024 * 1024

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

async function ensureAvatarBucket() {
  const admin = createAdminClient()
  const existing = await admin.storage.getBucket("avatars")

  if (!existing.error) return

  const created = await admin.storage.createBucket("avatars", {
    public: true,
    fileSizeLimit: tailleMax,
    allowedMimeTypes: formatsAutorises,
  })

  if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
    throw created.error
  }
}

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 12, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return jsonError("Trop de tentatives. Réessayez dans quelques instants.", 429)
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

  const formData = await request.formData()
  const avatar = formData.get("avatar")

  if (!(avatar instanceof File) || avatar.size === 0) {
    return jsonError("Image manquante.")
  }

  if (!formatsAutorises.includes(avatar.type)) {
    return jsonError("Format non autorisé. Utilisez PNG, JPG ou WebP.")
  }

  if (avatar.size > tailleMax) {
    return jsonError("L'image ne doit pas dépasser 3 Mo.")
  }

  await ensureAvatarBucket()

  const admin = createAdminClient()
  const extension = avatar.type === "image/png" ? "png" : avatar.type === "image/webp" ? "webp" : "jpg"
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`
  const uploaded = await admin.storage.from("avatars").upload(path, avatar, {
    contentType: avatar.type,
    upsert: false,
  })

  if (uploaded.error) {
    return jsonError(uploaded.error.message)
  }

  const avatarUrl = admin.storage.from("avatars").getPublicUrl(path).data.publicUrl
  const updated = await admin.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)

  if (updated.error) {
    return jsonError(updated.error.message)
  }

  return NextResponse.json({ avatarUrl })
}
