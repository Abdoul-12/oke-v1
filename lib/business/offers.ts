export type OffrePaiementType = "dossier" | "boost_projet" | "sponsor_offre" | "pack_investisseur"

export interface OffrePaiement {
  type: OffrePaiementType
  titre: string
  description: string
  montant: number
  cible: "investisseur" | "developpeur" | "entreprise"
  retour: string
  avantages: string[]
}

export const offresPaiement: Record<OffrePaiementType, OffrePaiement> = {
  dossier: {
    type: "dossier",
    titre: "Accéder au dossier complet",
    description: "Débloquez les informations stratégiques du projet sélectionné.",
    montant: 25000,
    cible: "investisseur",
    retour: "/projets",
    avantages: [
      "Business Plan détaillé",
      "Prévisions financières",
      "Architecture technique",
      "Analyse des risques",
      "Contact direct du développeur",
    ],
  },
  boost_projet: {
    type: "boost_projet",
    titre: "Booster la visibilité du projet",
    description: "Placez votre projet dans les zones prioritaires du catalogue pendant 7 jours.",
    montant: 10000,
    cible: "developpeur",
    retour: "/dashboard/developpeur",
    avantages: [
      "Badge Mis en avant",
      "Priorité dans le catalogue",
      "Présence dans les recommandations investisseurs",
      "Visibilité renforcée pendant 7 jours",
    ],
  },
  sponsor_offre: {
    type: "sponsor_offre",
    titre: "Sponsoriser une offre",
    description: "Augmentez la visibilité de votre offre auprès des talents tech africains.",
    montant: 50000,
    cible: "entreprise",
    retour: "/dashboard/entreprise",
    avantages: [
      "Badge Offre sponsorisée",
      "Mise en avant dans l'espace entreprises",
      "Priorité dans les recommandations talents",
      "Visibilité renforcée pendant 14 jours",
    ],
  },
  pack_investisseur: {
    type: "pack_investisseur",
    titre: "Pack investisseur 5 dossiers",
    description: "Prépayez plusieurs accès pour analyser plus vite les meilleurs projets.",
    montant: 100000,
    cible: "investisseur",
    retour: "/dashboard/investisseur",
    avantages: [
      "Crédit pour 5 dossiers complets",
      "Économie de 25 000 FCFA",
      "Suivi depuis le dashboard investisseur",
      "Accès prioritaire aux projets recommandés",
    ],
  },
}

export function getOffrePaiement(type?: string | null) {
  if (type && type in offresPaiement) {
    return offresPaiement[type as OffrePaiementType]
  }

  return offresPaiement.dossier
}

export function formatFcfa(montant: number) {
  return `${montant.toLocaleString("fr-FR")} FCFA`
}
