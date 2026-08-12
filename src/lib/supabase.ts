import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

/** Cliente simples (sem cookies). Preferir client/server SSR para auth. */
export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e a chave."
    );
  }
  return createClient(supabaseUrl, supabaseKey);
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}
