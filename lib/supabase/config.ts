export function isSupabaseConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      publishableKey &&
      publishableKey !== "your_supabase_anon_key" &&
      publishableKey !== "your_supabase_publishable_key",
  )
}

export function getSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || anonKey === "your_supabase_anon_key" || anonKey === "your_supabase_publishable_key") {
    throw new Error(
      "Variables Supabase manquantes. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    )
  }

  return { url, anonKey }
}
