// lib/supabase/client.ts
"use client";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient as SupabaseAuthClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseAuthClient | null = null;

export const createSupabaseBrowser = () => {
  if (supabaseClient) return supabaseClient;

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseClient;
};

export const getSupabaseBrowser = () => {
  if (!supabaseClient) {
    return createSupabaseBrowser();
  }
  return supabaseClient;
};
