import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { rateLimit } from "@/lib/security/rate-limit"
import { dashboardParRole, isRoleUtilisateur, roleDashboard, rolePaiement } from "@/lib/auth/roles"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const sensitiveRoutes = ["/connexion", "/inscription", "/paiement", "/profil", "/messagerie"]
  const isSensitive = sensitiveRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isSensitive) {
    const limiter = rateLimit(request, { limit: 120, windowMs: 60 * 1000 })

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez dans quelques instants." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limiter.resetAt - Date.now()) / 1000)),
          },
        },
      )
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || anonKey === "your_supabase_anon_key" || anonKey === "your_supabase_publishable_key") {
    return response
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedRoutes = ["/dashboard", "/profil", "/messagerie", "/paiement"]
  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/connexion"
    redirectUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(redirectUrl)
  }

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const role = profile?.role

    if (isRoleUtilisateur(role)) {
      const roleDashboardAttendu = roleDashboard(request.nextUrl.pathname)

      if (roleDashboardAttendu && roleDashboardAttendu !== role) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = dashboardParRole(role)
        redirectUrl.search = ""
        return NextResponse.redirect(redirectUrl)
      }

      if (request.nextUrl.pathname.startsWith("/profil") && role !== "developpeur") {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = dashboardParRole(role)
        redirectUrl.search = ""
        return NextResponse.redirect(redirectUrl)
      }

      if (request.nextUrl.pathname.startsWith("/paiement")) {
        const typePaiement = request.nextUrl.searchParams.get("type")
        const roleAttendu = rolePaiement(typePaiement)

        if (role !== roleAttendu) {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = dashboardParRole(role)
          redirectUrl.search = ""
          return NextResponse.redirect(redirectUrl)
        }
      }

      if (request.nextUrl.pathname === "/connexion" || request.nextUrl.pathname === "/inscription") {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = dashboardParRole(role)
        redirectUrl.search = ""
        return NextResponse.redirect(redirectUrl)
      }
    }

    if (request.nextUrl.pathname === "/connexion" || request.nextUrl.pathname === "/inscription") {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/"
      redirectUrl.search = ""
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}
