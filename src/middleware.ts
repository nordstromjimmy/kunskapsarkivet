// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (
    url.searchParams.has("token_hash") &&
    !url.pathname.startsWith("/reset/update")
  ) {
    const to = new URL("/reset/update", url);
    to.search = url.search;
    return NextResponse.redirect(to);
  }

  // 2) Otherwise continue and refresh Supabase session cookies as before
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", maxAge: 0, ...options });
        },
      },
    }
  );

  // This may update cookies on `res` (session refresh)
  await supabase.auth.getUser();
  return res;
}

export const config = {
  // run on all non-static routes
  matcher: [
    "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|map|txt)).*)",
  ],
};
