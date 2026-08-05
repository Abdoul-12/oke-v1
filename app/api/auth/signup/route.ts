import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  sanitizeText,
  validateEmail,
  validatePassword,
  validatePhone,
  validateSafeText,
} from "@/lib/security/input"
import { rateLimit } from "@/lib/security/rate-limit"

const roles = ["developpeur", "investisseur", "entreprise"] as const
const typesDeveloppeur = ["Front-end", "Back-end", "Full stack"] as const
const paysAutorises = [
  "Gabon",
  "Cameroun",
  "Côte d'Ivoire",
  "Sénégal",
  "Bénin",
  "Togo",
  "Rwanda",
  "Maroc",
  "Mali",
  "Burkina Faso",
]
const competencesAutorisees = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "Supabase",
  "Firebase",
  "React Native",
  "Python",
  "Django",
  "Laravel",
  "PHP",
  "UI/UX",
  "Figma",
  "Design",
]

function badRequest(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, { limit: 20, windowMs: 60 * 1000 })

  if (!limiter.allowed) {
    return badRequest("Trop de tentatives d'inscription. Réessayez dans quelques instants.", 429)
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return badRequest("Requête invalide.")
  }

  if (!payload || typeof payload !== "object") {
    return badRequest("Données d'inscription invalides.")
  }

  const data = payload as Record<string, unknown>
  const role = String(data.role ?? "")
  const prenom = validateSafeText("Le prénom", String(data.prenom ?? ""), 2, 60)
  const nom = validateSafeText("Le nom", String(data.nom ?? ""), 2, 80)
  const email = validateEmail(String(data.email ?? ""))
  const telephone = validatePhone(String(data.telephone ?? ""))
  const pays = String(data.pays ?? "")
  const indicatif = validateSafeText("L'indicatif", String(data.indicatif ?? ""), 2, 8)
  const developerType = sanitizeText(String(data.developer_type ?? ""), 40)
  const password = validatePassword(String(data.password ?? ""))
  const skills = Array.isArray(data.skills)
    ? data.skills
        .map((skill) => sanitizeText(String(skill), 40))
        .filter((skill, index, liste) => competencesAutorisees.includes(skill) && liste.indexOf(skill) === index)
        .slice(0, 16)
    : []

  if (!roles.includes(role as (typeof roles)[number])) {
    return badRequest("Rôle invalide.")
  }

  if (!paysAutorises.includes(pays)) {
    return badRequest("Pays invalide.")
  }

  if (role === "developpeur" && !typesDeveloppeur.includes(developerType as (typeof typesDeveloppeur)[number])) {
    return badRequest("Type de développeur invalide.")
  }

  for (const result of [prenom, nom, email, telephone, indicatif, password]) {
    if (!result.ok) {
      return badRequest(result.message)
    }
  }

  try {
    const supabase = createAdminClient()
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: email.value,
      password: password.value,
      email_confirm: true,
      user_metadata: {
        role,
        nom: nom.value,
        prenom: prenom.value,
        telephone: telephone.value,
        indicatif: indicatif.value,
        pays,
        developer_type: role === "developpeur" ? developerType : null,
        skills: role === "developpeur" ? skills : [],
      },
    })

    if (error) {
      const message = error.message.toLowerCase()

      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        return badRequest("Un compte existe déjà avec cette adresse email.", 409)
      }

      return badRequest(error.message)
    }

    if (!created.user) {
      return badRequest("Création du compte impossible pour le moment.")
    }

    return NextResponse.json({
      id: created.user.id,
      role,
      email: email.value,
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Création du compte impossible pour le moment.", 500)
  }
}
