export type RoleUtilisateur = "developpeur" | "investisseur" | "entreprise"

export function isRoleUtilisateur(role: unknown): role is RoleUtilisateur {
  return role === "developpeur" || role === "investisseur" || role === "entreprise"
}

export function dashboardParRole(role: RoleUtilisateur) {
  return `/dashboard/${role}`
}

export function rolePaiement(type?: string | null): RoleUtilisateur {
  if (type === "boost_projet") return "developpeur"
  if (type === "sponsor_offre") return "entreprise"
  return "investisseur"
}

export function roleDashboard(pathname: string): RoleUtilisateur | null {
  if (pathname.startsWith("/dashboard/developpeur")) return "developpeur"
  if (pathname.startsWith("/dashboard/investisseur")) return "investisseur"
  if (pathname.startsWith("/dashboard/entreprise")) return "entreprise"
  return null
}
