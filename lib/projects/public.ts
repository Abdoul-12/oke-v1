import { createClient } from "@/lib/supabase/server"

export interface ProjetPublic {
  id: string
  titre: string
  secteur: string
  promesse: string
  description: string
  budget: string
  financement: string
  progressionClasse: string
  image: string | null
  score: number
  sponsored: boolean
}

function progressionClasse(valeur: number) {
  if (valeur >= 90) return "w-[90%]"
  if (valeur >= 80) return "w-[80%]"
  if (valeur >= 75) return "w-[75%]"
  if (valeur >= 60) return "w-[60%]"
  if (valeur >= 40) return "w-[40%]"
  if (valeur >= 20) return "w-[20%]"
  return "w-[10%]"
}

export async function getProjetsPublics(limite = 4): Promise<ProjetPublic[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("projets")
      .select("id, titre, description, secteur, budget_cible, financement_pct, score, image_url, sponsored")
      .eq("statut", "actif")
      .order("sponsored", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limite)

    if (error || !data?.length) {
      return []
    }

    return data.map((projet) => {
      const financement = Number(projet.financement_pct ?? 0)
      const description = String(projet.description ?? "")

      return {
        id: String(projet.id),
        titre: String(projet.titre),
        secteur: String(projet.secteur),
        promesse: description.split(".")[0] || "Projet africain à fort potentiel",
        description,
        budget: `${Number(projet.budget_cible ?? 0).toLocaleString("fr-FR")} FCFA`,
        financement: `${financement}% financé`,
        progressionClasse: progressionClasse(financement),
        image: projet.image_url || null,
        score: Number(projet.score ?? 0),
        sponsored: Boolean(projet.sponsored),
      }
    })
  } catch {
    return []
  }
}
