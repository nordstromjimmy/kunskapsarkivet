import { createClient } from "@supabase/supabase-js";

// Public reads (anon) if you need it
export const supabaseServer = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

// Admin writes (service role) — server only
export const supabaseServerAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // DO NOT expose to client
    { auth: { persistSession: false } }
  );
