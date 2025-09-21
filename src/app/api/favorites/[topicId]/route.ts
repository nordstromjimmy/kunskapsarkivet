import { createClientRoute } from "@/app/lib/supabase/route";
import { NextResponse } from "next/server";

// POST /api/favorites/:topicId  -> add favorite
export async function POST(
  _: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;

  const supabase = await createClientRoute();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  //const topicId = params.topicId;
  if (!topicId) {
    return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    topic_id: topicId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/favorites/:topicId -> remove favorite
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const supabase = await createClientRoute();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!topicId) {
    return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("topic_id", topicId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
