import { NextResponse } from "next/server";
import { supabaseServer } from "@/server/db/supabase-server";

export async function POST() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
