import { NextResponse } from "next/server";
import { createClientSA } from "../../lib/supabase/actions";

export async function POST() {
  const supabase = await createClientSA();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
