import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { dashboardParRole, isRoleUtilisateur } from "@/lib/auth/roles"
import { rateLimit } from "@/lib/security/rate-limit"
import { validateEmail, validatePassword } from "@/lib/security/input"
import { getSupabaseServerAuthEnv } from "@/lib/supabase/config"

type CookieToSet = {
  name: string
  value: string
  options?: Parameters<NextResponse["cookies"]["set"]>[2]
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 20, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return jsonError("Trop de tentatives de connexion. Réessayez dans quelques instants.", 429)
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return jsonError("Requête invalide.")
  }

  if (!payload || typeof payload !== "object") {
    return jsonError("Identifiants invalides.")
  }

  const data = payload as Record<string, unknown>
  const email = validateEmail(String(data.email ?? ""))
  const password = validatePassword(String(data.password ?? ""))

  if (!email.ok) {
    return jsonError("Entrez l'email utilisé à l'inscription.")
  }

  if (!password.ok) {
    return jsonError(password.message)
  }

  try {
    const { url, anonKey } = getSupabaseServerAuthEnv()
    const cookiesToSet: CookieToSet[] = []

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(items) {
          cookiesToSet.push(...items)
        },
      },
    })

    const { data: signedIn, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error || !signedIn.user) {
      return jsonError("Identifiants incorrects. Vérifiez votre email et votre mot de passe.", 401)
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", signedIn.user.id).single()
    const role = profile?.role
    const dashboard = isRoleUtilisateur(role) ? dashboardParRole(role) : "/"
    const response = NextResponse.json({ role, dashboard })

    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Connexion impossible pour le moment.", 500)
  }
}
