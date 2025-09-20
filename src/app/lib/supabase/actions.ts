// src/app/lib/supabase/actions.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createClientSA() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Use object overload to satisfy Next's types
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // Respect incoming options and expire the cookie
          cookieStore.set({ name, value: "", maxAge: 0, ...options });
          // Alternatively: cookieStore.delete(name) — but using options avoids “unused var”
        },
      },
    }
  );
}
