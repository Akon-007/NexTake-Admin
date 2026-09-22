import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

/**
 * Supabase client.
 *
 * `persistSession` + `autoRefreshToken` (both on by default) keep the admin
 * signed in across page refreshes and expire the session when the refresh
 * token lapses. When the project credentials are absent the client is `null`
 * and the app falls back to its local demo backend instead of crashing.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "nextake-admin-auth",
      },
    })
  : null;

export { isSupabaseConfigured };
