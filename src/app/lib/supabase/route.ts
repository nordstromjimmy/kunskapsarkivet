// src/app/lib/supabase/route.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createClientRoute() {
  const cookieStore = await cookies(); // Route Handlers have mutable cookies

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // use the object overload to satisfy Next’s types
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // expire the cookie while preserving attributes (domain/path)
          cookieStore.set({ name, value: "", maxAge: 0, ...options });
        },
      },
    }
  );
}
