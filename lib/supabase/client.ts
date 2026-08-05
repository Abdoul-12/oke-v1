import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseBrowserEnv } from "./config"

export function createClient() {
  const { url, anonKey } = getSupabaseBrowserEnv()
  return createBrowserClient(url, anonKey)
}
