import { createClient } from "@supabase/supabase-js";

/**
 * One Supabase client for the whole app — public pages and the Dashboard
 * alike. Unlike the old Django backend's split between a same-origin
 * `apiClient` (cookies, for the Dashboard) and a direct-to-backend
 * `publicClient` (no cookies, for public reads), there's nothing to split
 * here: Supabase Auth uses a bearer JWT (kept in local storage by this
 * client), not a cookie, so calling it directly from the browser carries no
 * cross-origin cookie problem. Row Level Security (see
 * `supabase/schema.sql`) is what actually decides whether a given request
 * is allowed — anonymous reads vs. signed-in writes — not which client
 * object made it.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — set them in Frontend/.env.local for dev, or in Vercel's Project Settings → Environment Variables for prod.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
