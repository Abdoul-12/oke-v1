import { createClient } from "@/lib/supabase/server"
import type { RoleUtilisateur } from "@/lib/auth/roles"

export interface ProfilPublic {
  id: string
  role: RoleUtilisateur
  nomComplet: string
  titre: string
  pays: string
  bio: string
  avatarUrl: string | null
  initiales: string
  score: number
  verifie: boolean
  premium: boolean
  developerType: string | null
  skills: string[]
  progressionClasse: string
  couleur: string
}

const couleurs = ["bg-secondary", "bg-primary", "bg-violet-600", "bg-orange-600"]

function progressionClasse(valeur: number) {
  if (valeur >= 90) return "w-[90%]"
  if (valeur >= 80) return "w-[80%]"
  if (valeur >= 70) return "w-[70%]"
  if (valeur >= 60) return "w-[60%]"
  if (valeur >= 40) return "w-[40%]"
  if (valeur >= 20) return "w-[20%]"
  return "w-[10%]"
}

function titreParRole(role: RoleUtilisateur, developerType?: string | null) {
  if (role === "developpeur") return developerType ? `Développeur ${developerType}` : "Développeur"
  if (role === "investisseur") return "Investisseur OkeTech"
  return "Entreprise OkeTech"
}

function initiales(prenom: string, nom: string) {
  const premiere = prenom.trim()[0] ?? nom.trim()[0] ?? "O"
  const deuxieme = nom.trim()[0] ?? prenom.trim()[1] ?? "K"
  return `${premiere}${deuxieme}`.toUpperCase()
}

export async function getProfilsPublics(role: RoleUtilisateur, limite = 12): Promise<ProfilPublic[]> {
  try {
    const supabase = await createClient()
    const profilsAvances = await supabase
      .from("profiles")
      .select("id, role, nom, prenom, pays, bio, avatar_url, score, verifie, premium, developer_type, skills, created_at")
      .eq("role", role)
      .order("premium", { ascending: false })
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limite)

    const { data, error } = profilsAvances.error
      ? await supabase
          .from("profiles")
          .select("id, role, nom, prenom, pays, bio, avatar_url, score, verifie, premium, created_at")
          .eq("role", role)
          .order("premium", { ascending: false })
          .order("score", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(limite)
      : profilsAvances

    if (error || !data?.length) {
      return []
    }

    return data.map((profil, index) => {
      const skills = "skills" in profil && Array.isArray(profil.skills) ? profil.skills.map(String).slice(0, 6) : []
      const developerType = "developer_type" in profil && typeof profil.developer_type === "string" ? profil.developer_type : null
      const nom = String(profil.nom ?? "").trim()
      const prenom = String(profil.prenom ?? "").trim()
      const nomComplet = role === "entreprise" ? nom || "Entreprise OkeTech" : `${prenom} ${nom}`.trim() || "Membre OkeTech"
      const score = Number(profil.score ?? 0)

      return {
        id: String(profil.id),
        role,
        nomComplet,
        titre: titreParRole(role, developerType),
        pays: String(profil.pays ?? "Afrique"),
        bio: String(profil.bio ?? "").trim(),
        avatarUrl: profil.avatar_url || null,
        initiales: initiales(prenom, nom),
        score,
        verifie: Boolean(profil.verifie),
        premium: Boolean(profil.premium),
        developerType,
        skills,
        progressionClasse: progressionClasse(score),
        couleur: couleurs[index % couleurs.length],
      }
    })
  } catch {
    return []
  }
}
